// Initialize date/time pickers with UTC handling
function initDateTimePickers() {
    const dateTimeConfig = {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        time_24hr: true,
        minDate: "2025-01-01",
        maxDate: "2100-12-31",
        defaultHour: 0,
        defaultMinute: 0,
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length) {
                // Convert to UTC and format as YYYY-MM-DD HH:MM
                const utcDate = new Date(selectedDates[0].getTime() - selectedDates[0].getTimezoneOffset() * 60000);
                instance.input.value = utcDate.toISOString().slice(0, 16).replace('T', ' ');              
                const row = instance.input.closest('tr');
                if (instance.input.classList.contains('start-time')) {
                    const endTimeInput = row.querySelector('.end-time');
                    if (endTimeInput && endTimeInput._flatpickr) {
                        endTimeInput._flatpickr.set('minDate', new Date(selectedDates[0].getTime() + 60000)); // Add 1 minute to prevent same time
                    }
                }                
                // Validate time relationship
                validateTimeRelationship(row);
            }
        }
    };
    // Initialize start time pickers
    document.querySelectorAll('.start-time').forEach(el => {
        if (!el._flatpickr) {
            flatpickr(el, {
                ...dateTimeConfig,
                onChange: function(selectedDates, dateStr, instance) {
                    if (selectedDates.length) {
                        const utcDate = new Date(selectedDates[0].getTime() - selectedDates[0].getTimezoneOffset() * 60000);
                        instance.input.value = utcDate.toISOString().slice(0, 16).replace('T', ' ');                     
                        const row = instance.input.closest('tr');
                        const endTimeInput = row.querySelector('.end-time');
                        if (endTimeInput && endTimeInput._flatpickr) {
                            endTimeInput._flatpickr.set('minDate', new Date(selectedDates[0].getTime() + 60000)); // Add 1 minute to prevent same time
                        }                      
                        validateTimeRelationship(row);
                    }
                }
            });
        }
    });
    // Initialize end time pickers
    document.querySelectorAll('.end-time').forEach(el => {
        if (!el._flatpickr) {
            flatpickr(el, {
                ...dateTimeConfig,
                onChange: function(selectedDates, dateStr, instance) {
                    if (selectedDates.length) {
                        const utcDate = new Date(selectedDates[0].getTime() - selectedDates[0].getTimezoneOffset() * 60000);
                        instance.input.value = utcDate.toISOString().slice(0, 16).replace('T', ' ');
                        validateTimeRelationship(instance.input.closest('tr'));
                    }
                }
            });
        }
    });
}

// Add a new row to the schedule table
function addRow() {
    const table = document.getElementById('scheduleTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();    
    newRow.innerHTML = `
        <td><input type="text" class="editable-input" placeholder="CHG#" required></td>
        <td>
            <select class="region-select" required>
                <option value="">Select Region</option>
                <option value="HK">HK</option>
                <option value="UK">UK</option>
                <option value="US">US</option>
            </select>
        </td>
        <td>
            <select class="environment-select" required>
                <option value="">Select Environment</option>
                <option value="Prod">Prod</option>
                <option value="Preprod">Preprod</option>
            </select>
        </td>
        <td>
            <input type="text" class="datetime-input start-time" placeholder="Select start time" required>
            <div class="time-error start-error">Start time must be before end time</div>
        </td>
        <td>
            <input type="text" class="datetime-input end-time" placeholder="Select end time" required>
            <div class="time-error end-error">End time must be after start time</div>
        </td>
        <td>
            <select class="status-select" onchange="updateStatusColor(this)" required>
                <option value="">Select Status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Postponed">Postponed</option>
                <option value="To Start">To Start</option>
            </select>
        </td>
        <td><button class="button remove" onclick="removeRow(this)">Remove</button></td>
    `;
    // Initialize date/time pickers for the new row
    initDateTimePickers(); 
    // Add event listener for the new status select
    newRow.querySelector('.status-select').addEventListener('change', function() {
        updateStatusColor(this);
    });
}
// Add new optional header row
function addOptionalRow() {
    const table = document.getElementById('optionalHeadersTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();    
    newRow.innerHTML = `
        <td><input type="text" class="editable-input" placeholder="e.g., Reference"></td>
        <td><textarea class="editable-textarea" placeholder="Enter content here..."></textarea></td>
        <td><button class="button remove" onclick="removeOptionalRow(this)">Remove</button></td>
    `;
}
// Remove optional header row
function removeOptionalRow(button) {
    const row = button.closest('tr');
    const table = document.getElementById('optionalHeadersTable').getElementsByTagName('tbody')[0];
    if (table.rows.length > 1) {
        row.remove();
    }
}
// Update row color based on status selection
function updateStatusColor(selectElement) {
    const row = selectElement.closest('tr');
    row.className = '';
    if (selectElement.value) {
        row.classList.add(`status-${selectElement.value.toLowerCase().replace(' ', '')}`);
    }
}
// Remove a row from the schedule table
function removeRow(button) {
    const row = button.closest('tr');
    const table = document.getElementById('scheduleTable').getElementsByTagName('tbody')[0];
    if (table.rows.length > 1) {
        row.remove();
    } else {
        alert("You must have at least one row in the table.");
    }
    validateTable();
}
// Validate time relationship in a row
function validateTimeRelationship(row) {
    const startInput = row.querySelector('.start-time');
    const endInput = row.querySelector('.end-time');
    const startError = row.querySelector('.start-error');
    const endError = row.querySelector('.end-error');  
    if (!startInput.value || !endInput.value) {
        startError.style.display = 'none';
        endError.style.display = 'none';
        return true;
    }  
    const startDate = new Date(startInput.value);
    const endDate = new Date(endInput.value); 
    if (startDate.getTime() >= endDate.getTime()) {
        startError.style.display = 'block';
        endError.style.display = 'block';
        return false;
    } else {
        startError.style.display = 'none';
        endError.style.display = 'none';
        return true;
    }
}
// Validate all time relationships in the table
function validateAllTimeRelationships() {
    const rows = document.querySelectorAll('#scheduleTable tbody tr');
    let isValid = true;
    rows.forEach(row => {
        if (!validateTimeRelationship(row)) {
            isValid = false;
        }
    });  
    return isValid;
}
// Validate all required fields
function validateForm() {
    let isValid = true; 
    // Validate change description
    const desc = document.getElementById('changeDescription');
    const descError = document.getElementById('descError');
    if (!desc.value.trim()) {
        descError.style.display = 'block';
        isValid = false;
    } else {
        descError.style.display = 'none';
    }
    // Validate impact
    const impact = document.getElementById('impactText');
    const impactError = document.getElementById('impactError');
    if (!impact.value.trim()) {
        impactError.style.display = 'block';
        isValid = false;
    } else {
        impactError.style.display = 'none';
    } 
    // Validate table
    isValid = validateTable() && isValid;    
    // Validate time relationships
    isValid = validateAllTimeRelationships() && isValid;
    return isValid;
}
// Validate table has at least one complete row
function validateTable() {
    const tableError = document.getElementById('tableError');
    const rows = document.querySelectorAll('#scheduleTable tbody tr');
    if (rows.length === 0) {
        tableError.style.display = 'block';
        return false;
    }    
    let hasValidRow = false;
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input[required], select[required]');
        let rowValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) rowValid = false;
        });
        if (rowValid) hasValidRow = true;
    });
    if (!hasValidRow) {
        tableError.style.display = 'block';
        return false;
    }
    tableError.style.display = 'none';
    return true;
}
// Save draft to local storage
function saveDraft() {
    if (validateForm()) {
        const content = {
            topHeader: document.querySelector('.top-header').textContent,
            header1: document.querySelector('.header h1').textContent,
            header2: document.querySelector('.header .meta').textContent,
            changeDescription: document.getElementById('changeDescription').value,
            impactText: document.getElementById('impactText').value,
            questionsText: document.getElementById('questionsText').value,
            tableData: getTableData(),
            optionalHeadersData: getOptionalHeadersData(),
            internalFooter: document.querySelector('.internal-footer').textContent
        };
        localStorage.setItem('siteSwitchDraft', JSON.stringify(content));
        alert('Draft saved successfully!');
    }
}
// Get optional headers data
function getOptionalHeadersData() {
    return Array.from(document.querySelectorAll('#optionalHeadersTable tbody tr')).map(row => {
        return {
            name: row.querySelector('input').value,
            content: row.querySelector('textarea').value
        };
    });
}
// Load draft from local storage
function loadDraft() {
    const savedDraft = localStorage.getItem('siteSwitchDraft');
    if (savedDraft) {
        const content = JSON.parse(savedDraft);
        document.querySelector('.top-header').textContent = content.topHeader || 'DEAR USERS OF SHP PLATFORM';
        document.querySelector('.header h1').textContent = content.header1;
        document.querySelector('.header .meta').textContent = content.header2;    
        document.getElementById('changeDescription').value = content.changeDescription;
        document.getElementById('impactText').value = content.impactText;
        document.getElementById('questionsText').value = content.questionsText;
        document.querySelector('.internal-footer').textContent = content.internalFooter || 'INTERNAL';
        setTableData(content.tableData);   
        // Load optional headers if they exist
        if (content.optionalHeadersData) {
            const tbody = document.querySelector('#optionalHeadersTable tbody');
            tbody.innerHTML = '';
            content.optionalHeadersData.forEach(header => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="text" class="editable-input" value="${header.name || ''}"></td>
                    <td><textarea class="editable-textarea">${header.content || ''}</textarea></td>
                    <td><button class="button remove" onclick="removeOptionalRow(this)">Remove</button></td>
                `;
                tbody.appendChild(row);
            });
            // Ensure at least one empty row exists
            if (content.optionalHeadersData.length === 0) {
                addOptionalRow();
            }
        }
    }
}
// Generate email content optimized for Outlook
function generateEmailContent() {
    let tableContent = '';
    const rows = document.querySelectorAll('#scheduleTable tbody tr');  
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const status = cells[5].querySelector('select').value;
        let statusClass = '';    
        // Map status to background colors
        switch(status.toLowerCase().replace(' ', '')) {
            case 'inprogress': statusClass = 'background-color:#fff3cd;'; break;
            case 'completed': statusClass = 'background-color:#d4edda;'; break;
            case 'postponed': statusClass = 'background-color:#f8d7da;'; break;
            case 'tostart': statusClass = 'background-color:#e2e3e5;'; break;
        }     
        tableContent += `
            <tr style="${statusClass}">
                <td style="border:1px solid #8B0000;padding:6px;">${cells[0].querySelector('input').value}</td>
                <td style="border:1px solid #8B0000;padding:6px;">${cells[1].querySelector('select').value}</td>
                <td style="border:1px solid #8B0000;padding:6px;">${cells[2].querySelector('select').value}</td>
                <td style="border:1px solid #8B0000;padding:6px;">${cells[3].querySelector('input').value}</td>
                <td style="border:1px solid #8B0000;padding:6px;">${cells[4].querySelector('input').value}</td>
                <td style="border:1px solid #8B0000;padding:6px;">${cells[5].querySelector('select').value}</td>
            </tr>
        `;
    });  
    // Generate HTML for optional headers
    let optionalHeadersContent = '';
    const optionalRows = document.querySelectorAll('#optionalHeadersTable tbody tr');
    optionalRows.forEach(row => {
        const headerName = row.querySelector('input').value;
        const headerContent = row.querySelector('textarea').value;      
        if (headerName && headerContent) {
            optionalHeadersContent += `
                <tr>
                    <td style="padding:20px 0;">
                        <h2 style="font-size:18px;margin:0 0 12px 0.8em;color:#444;font-family:Arial,sans-serif;font-weight:bold;">${headerName}</h2>
                        <p style="margin:0 0 0 0.8em;white-space:pre-wrap;font-family:Arial,sans-serif;">${headerContent.replace(/\n/g, '<br>').replace(/<br><br>/g, '<br>')}</p>
                    </td>
                </tr>
            `;
        }
    });
    // Get the text content without extra line breaks
    const getCleanText = (elementId) => {
        const text = document.getElementById(elementId).value;
        return text.replace(/\n/g, '<br>').replace(/<br><br>/g, '<br>');
    };  
    return `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:1000px;margin:0 auto;border:1px solid #8B0000;border-radius:4px;overflow:hidden;font-family:Arial,sans-serif;">
            <!-- Top Header -->
            <tr>
                <td bgcolor="#005baa" style="padding:12px 16px;color:white;text-align:center;font-weight:bold;font-size:18px;font-family:Arial,sans-serif;border-bottom:1px solid #003366;">
                    ${document.querySelector('.top-header').textContent}
                </td>
            </tr>       
            <!-- Header -->
            <tr>
                <td bgcolor="#8B0000" style="padding:15px 16px;color:white;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="text-align:center;">
                                <h1 style="margin:0;font-weight:bold;font-size:22px;font-family:Arial,sans-serif;">${document.querySelector('.header h1').textContent}</h1>
                                <div style="font-size:14px;margin-top:5px;opacity:0.9;font-family:Arial,sans-serif;">${document.querySelector('.header .meta').textContent}</div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>         
            <!-- Content -->
            <tr>
                <td style="padding:0;">
                    <table border="0" cellpadding="16" cellspacing="0" width="100%">
                        <!-- Description -->
                        <tr>
                            <td style="padding:0 0 20px 0;">
                                <h2 style="font-size:18px;margin:0 0 12px 0.8em;color:#444;font-family:Arial,sans-serif;font-weight:bold;">Description</h2>
                                <p style="margin:0 0 0 0.8em;white-space:pre-wrap;font-family:Arial,sans-serif;">${getCleanText('changeDescription')}</p>
                            </td>
                        </tr>
                        
                        <!-- Schedule -->
                        <tr>
                            <td style="padding:20px 0;">
                                <h2 style="font-size:18px;margin:0 0 12px 0.8em;color:#444;font-family:Arial,sans-serif;font-weight:bold;">Schedule</h2>
                                <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #8B0000;width:100%;">
                                    <thead>
                                        <tr>
                                            <th style="border:1px solid #8B0000;padding:6px;text-align:left;background-color:#f2f2f2;font-weight:600;font-family:Arial,sans-serif;">CHG#</th>
                                            <th style="border:1px solid #8B0000;padding:6px;text-align:left;background-color:#f2f2f2;font-weight:600;font-family:Arial,sans-serif;">Region</th>
                                            <th style="border:1px solid #8B0000;padding:6px;text-align:left;background-color:#f2f2f2;font-weight:600;font-family:Arial,sans-serif;">Environment</th>
                                            <th style="border:1px solid #8B0000;padding:6px;text-align:left;background-color:#f2f2f2;font-weight:600;font-family:Arial,sans-serif;">Implementation Start Time (UTC)</th>
                                            <th style="border:1px solid #8B0000;padding:6px;text-align:left;background-color:#f2f2f2;font-weight:600;font-family:Arial,sans-serif;">Implementation End Time (UTC)</th>
                                            <th style="border:1px solid #8B0000;padding:6px;text-align:left;background-color:#f2f2f2;font-weight:600;font-family:Arial,sans-serif;">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tableContent}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Impact -->
                        <tr>
                            <td style="padding:20px 0;">
                                <h2 style="font-size:18px;margin:0 0 12px 0.8em;color:#444;font-family:Arial,sans-serif;font-weight:bold;">Impact</h2>
                                <p style="margin:0 0 0 0.8em;white-space:pre-wrap;font-family:Arial,sans-serif;">${getCleanText('impactText')}</p>
                            </td>
                        </tr>              
                        <!-- Optional Headers -->
                        ${optionalHeadersContent}          
                        <!-- Questions -->
                        <tr>
                            <td style="padding:20px 0 0 0;">
                                <h2 style="font-size:18px;margin:0 0 12px 0.8em;color:#444;font-family:Arial,sans-serif;font-weight:bold;">Questions and further information</h2>
                                <div style="background-color:#f8f9fa;border:1px solid #ddd;padding:12px;border-radius:4px;margin-bottom:12px;font-family:Arial,sans-serif;">
                                    <p style="margin:0;font-weight:bold;">For any issues seen during the release window please raise an ESSD and/or Matters:</p>
                                    <p style="margin:4px 0 0 0;"><a href="https://wpb-confluence.systems.uk.hsbc/display/TO/Guide+for+Cross+Functional+Teams" style="color:#0066cc;text-decoration:none;">https://wpb-confluence.systems.uk.hsbc/display/TO/Guide+for+Cross+Functional+Teams</a></p>
                                    <p style="margin:12px 0 0 0;font-weight:bold;">Please refer to this self-help page before reaching out to teams for tickets:</p>
                                    <p style="margin:4px 0 0 0;"><a href="https://wpb-confluence.systems.uk.hsbc/display/DCSE/SHP+Tenants+-+Self+Help+Page+for+Common+Issues" style="color:#0066cc;text-decoration:none;">https://wpb-confluence.systems.uk.hsbc/display/DCSE/SHP+Tenants+-+Self+Help+Page+for+Common+Issues</a></p>
                                </div>
                                <p style="margin:0 0 0 0.8em;white-space:pre-wrap;font-family:Arial,sans-serif;">${getCleanText('questionsText')}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>    
            <!-- Footer -->
            <tr>
                <td bgcolor="#8B0000" style="padding:12px 16px;color:white;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding:0 0 12px 0;">
                                <table border="0" cellpadding="12" cellspacing="0" width="100%" bgcolor="#000000" style="border:1px solid #8B0000;border-radius:4px;">
                                    <tr>
                                        <td width="50%" valign="top" style="font-family:Arial,sans-serif;">
                                            <div style="font-weight:bold;margin-bottom:4px;color:#8B0000;">SUPPORT EMAIL</div>
                                            <div>dpsr@hsbc.co.uk</div>
                                        </td>
                                        <td width="50%" valign="top" style="font-family:Arial,sans-serif;">
                                            <div style="font-weight:bold;margin-bottom:4px;color:#8B0000;">XMATTERS</div>
                                            <div>Digital Platform Operations</div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:8px;background-color:#8B0000;color:white;font-weight:bold;border-top:1px solid #ffffff;text-align:center;font-family:Arial,sans-serif;">
                                Next update will be provided as soon as new information becomes available.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>            
            <!-- Internal Footer -->
            <tr>
                <p style="text-align: center;">
                <img src="https://raw.githubusercontent.com/kalo143225/my-test-site/refs/heads/master/hsbclogo.jpg" alt="Logo" width="150">
                </p>
                <td bgcolor="#333" style="padding:10px 16px;color:white;text-align:center;font-weight:bold;border-top:1px solid #555;font-family:Arial,sans-serif;">
                    ${document.querySelector('.internal-footer').textContent}
                </td>
            </tr>
        </table>
    `;
}
// Show preview of the content
function showPreview() {
    if (validateForm()) {
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = generateEmailContent();
        document.getElementById('previewSection').style.display = 'block';
        document.getElementById('copySection').style.display = 'block';
        previewContent.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert('Please fill in all required fields and ensure time ranges are valid before previewing.');
    }
}
// Copy content to clipboard (Outlook optimized)
function copyToClipboard() {
    // Create a temporary div with the email content
    const previewContent = document.getElementById('previewContent');
    //const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateEmailContent();
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv); 
    // Select the content
    const range = document.createRange();
    range.selectNode(tempDiv);
    const selection = window.getSelection();
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range); 
    try {
        // Execute the copy command
        const successful = document.execCommand('copy');
        if (successful) {
            const copyMessage = document.getElementById('copyMessage');
            copyMessage.style.display = 'block';
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 3000);
        } else {
            alert('Failed to copy email content. Please try again.');
        }
    } catch (err) {
        alert('Error copying email content: ' + err);
    } 
    // Clean up
    window.getSelection().removeAllRanges();
    document.body.removeChild(tempDiv);
}
// Get all table data
function getTableData() {
    return Array.from(document.querySelectorAll('#scheduleTable tbody tr')).map(row => {
        const cells = row.querySelectorAll('td');
        return {
            chg: cells[0].querySelector('input').value,
            region: cells[1].querySelector('select').value,
            environment: cells[2].querySelector('select').value,
            startTime: cells[3].querySelector('input').value,
            endTime: cells[4].querySelector('input').value,
            status: cells[5].querySelector('select').value
        };
    });
}
// Populate table with saved data
function setTableData(data) {
    const tbody = document.querySelector('#scheduleTable tbody');
    tbody.innerHTML = ''; 
    data.forEach(rowData => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="editable-input" value="${rowData.chg || ''}"></td>
            <td>
                <select class="region-select">
                    <option value="">Select Region</option>
                    <option value="HK" ${rowData.region === 'HK' ? 'selected' : ''}>HK</option>
                    <option value="UK" ${rowData.region === 'UK' ? 'selected' : ''}>UK</option>
                    <option value="US" ${rowData.region === 'US' ? 'selected' : ''}>US</option>
                </select>
            </td>
            <td>
                <select class="environment-select">
                    <option value="">Select Environment</option>
                    <option value="Prod" ${rowData.environment === 'Prod' ? 'selected' : ''}>Prod</option>
                    <option value="Preprod" ${rowData.environment === 'Preprod' ? 'selected' : ''}>Preprod</option>
                </select>
            </td>
            <td>
                <input type="text" class="datetime-input start-time" value="${rowData.startTime || ''}" placeholder="Select start time" required>
                <div class="time-error start-error">Start time must be before end time</div>
            </td>
            <td>
                <input type="text" class="datetime-input end-time" value="${rowData.endTime || ''}" placeholder="Select end time" required>
                <div class="time-error end-error">End time must be after start time</div>
            </td>
            <td>
                <select class="status-select" onchange="updateStatusColor(this)">
                    <option value="">Select Status</option>
                    <option value="Completed" ${rowData.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="In Progress" ${rowData.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Postponed" ${rowData.status === 'Postponed' ? 'selected' : ''}>Postponed</option>
                    <option value="To Start" ${rowData.status === 'To Start' ? 'selected' : ''}>To Start</option>
                </select>
            </td>
            <td><button class="button remove" onclick="removeRow(this)">Remove</button></td>
        `;
        tbody.appendChild(row);
        if (rowData.status) {
            updateStatusColor(row.querySelector('.status-select'));
        }
    }); 
    // Ensure at least one empty row exists
    if (data.length === 0) {
        addRow();
    }  
    // Initialize date/time pickers for all rows
    initDateTimePickers();
    // Validate time relationships for all rows
    validateAllTimeRelationships();
}
// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to buttons and Top Header
    //Header Validation
    function checkTopHeader() {
        let isValid = true;
        const topHeader = document.querySelector('.top-header');
        const topHeaderError = document.getElementById('topHeaderError');
        if (topHeader.textContent.trim() === "Dear") {
            topHeaderError.style.display = 'block';
            isValid = false;
        } else {
            topHeaderError.style.display = 'none';
            isValid = true;
        }
        return isValid;
    }
    document.getElementById('addRowBtn').addEventListener('click', addRow);
    document.getElementById('addOptionalRowBtn').addEventListener('click', addOptionalRow);
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    document.getElementById('previewBtn').addEventListener('click', showPreview);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);  
    // Initialize datetime pickers for existing rows
    initDateTimePickers();
    // Initialize status selectors in the default row
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function() {
            updateStatusColor(this);
        });
    }); 
    loadDraft();
    // Add validation on blur for required fields
    document.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = '#dc3545';
                this.style.boxShadow = '0 0 0 2px rgba(220, 53, 69, 0.1)';
            } else {
                this.style.borderColor = '#ddd';
                this.style.boxShadow = 'none';
            }
        });
    });
});
