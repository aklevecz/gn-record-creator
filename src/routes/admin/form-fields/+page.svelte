<script>
    import { formFields } from '$lib/monday/formFields.js';
    
    const auth = 'kjASDhAUwdhuAHWDuhAWudhaUWhduaHWduhasjkjakl';
    
    // Group fields by category for better visualization
    const fieldCategories = {
        'Contact Information': ['contact_first_name', 'contact_last_name', 'contact_email', 'phone'],
        'Project Information': ['title', 'artist', 'label', 'catalog_number'],
        'Dates': ['release_date', 'depot_date', 'create_date', 'updated_at'],
        'Shipping': ['shipping_address', 'shipping_logistics'],
        'Production Details': ['total_units', 'records_per_set', 'record_format', 'record_color', 'opacity', 'lacquers', 'metalwork', 'test_prints', 'packaging'],
        'Meta Fields': ['source', 'status', 'submitted', 'notes', 'name']
    };
    
    /** @param {string} type */
    function getFieldTypeColor(type) {
        /** @type {Record<string, string>} colors */
        const colors = {
            'text': '#3498db',
            'email': '#e74c3c',
            'tel': '#9b59b6',
            'date': '#f39c12',
            'address': '#2ecc71',
            'dropdown': '#34495e',
            'select': '#16a085',
            'number': '#e67e22',
            'status': '#95a5a6',
            'name': '#8e44ad'
        };
        return colors[type] || '#7f8c8d';
    }
    
    /** @param {string} value */
    function formatDefaultValue(value) {
        if (Array.isArray(value)) {
            return value.length > 0 ? JSON.stringify(value) : '[]';
        }
        return value === '' ? '(empty string)' : String(value);
    }
</script>

<div class="form-fields-admin">
    <h1>Form Fields Visualization</h1>
    <p>Current form structure with {Object.keys(formFields).length} total fields</p>
    
    {#each Object.entries(fieldCategories) as [categoryName, fieldKeys]}
        <div class="category-section">
            <h2>{categoryName}</h2>
            <div class="fields-grid">
                {#each fieldKeys as fieldKey}
                    {@const field = formFields[fieldKey]}
                    {#if field}
                        <div class="field-card">
                            <div class="field-header">
                                <h3>{field.label}</h3>
                                <span class="field-type" style="background-color: {getFieldTypeColor(field.type)}">
                                    {field.type}
                                </span>
                                {#if field.required}
                                    <span class="required-indicator">*</span>
                                {/if}
                            </div>
                            
                            <div class="field-details">
                                <div class="detail-row">
                                    <strong>Key:</strong> <code>{field.key}</code>
                                </div>
                                <div class="detail-row">
                                    <strong>Monday ID:</strong> <code>{field.mondayId}</code>
                                </div>
                                <div class="detail-row">
                                    <strong>Monday Type:</strong> <span class="monday-type">{field.mondayType}</span>
                                </div>
                                {#if field.description}
                                    <div class="detail-row">
                                        <strong>Description:</strong> {field.description}
                                    </div>
                                {/if}
                                <div class="detail-row">
                                    <strong>Default Value:</strong> <code>{formatDefaultValue(field.defaultValue)}</code>
                                </div>
                                {#if field.maxSelections}
                                    <div class="detail-row">
                                        <strong>Max Selections:</strong> {field.maxSelections}
                                    </div>
                                {/if}
                                {#if field.tooltip}
                                    <div class="detail-row">
                                        <strong>Tooltip:</strong> {field.tooltip.cta}
                                    </div>
                                {/if}
                            </div>
                            
                            {#if field.options && field.options.length > 0}
                                <div class="field-options">
                                    <strong>Options ({field.options.length}):</strong>
                                    <div class="options-list">
                                        {#each field.options as option, index}
                                            <div class="option-item">
                                                <span class="option-index">{index}</span>
                                                <span class="option-value">{option.value}</span>
                                                {#if option.color}
                                                    <div class="color-swatch" style="background-color: {option.color}"></div>
                                                {/if}
                                                {#if option.img}
                                                    <span class="option-img">📷 {option.img}</span>
                                                {/if}
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    {/each}
    
    <div class="summary-section">
        <h2>Summary</h2>
        <div class="summary-stats">
            <div class="stat-card">
                <h3>Total Fields</h3>
                <div class="stat-number">{Object.keys(formFields).length}</div>
            </div>
            <div class="stat-card">
                <h3>Required Fields</h3>
                <div class="stat-number">{Object.values(formFields).filter(f => f.required).length}</div>
            </div>
            <div class="stat-card">
                <h3>Fields with Options</h3>
                <div class="stat-number">{Object.values(formFields).filter(f => f.options && f.options.length > 0).length}</div>
            </div>
            <div class="stat-card">
                <h3>Field Types</h3>
                <div class="stat-number">{new Set(Object.values(formFields).map(f => f.type)).size}</div>
            </div>
        </div>
    </div>
</div>

<style>
    .form-fields-admin {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
        background-color: #f8f9fa;
        min-height: 100vh;
        color: #333;
    }
    
    h1 {
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    h1 + p {
        color: #7f8c8d;
        margin-bottom: 2rem;
    }
    
    .category-section {
        margin-bottom: 3rem;
    }
    
    .category-section h2 {
        color: #34495e;
        border-bottom: 2px solid #3498db;
        padding-bottom: 0.5rem;
        margin-bottom: 1.5rem;
    }
    
    .fields-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 1.5rem;
    }
    
    .field-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid #e1e8ed;
    }
    
    .field-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }
    
    .field-header h3 {
        margin: 0;
        color: #2c3e50;
        flex: 1;
        min-width: 0;
    }
    
    .field-type {
        background-color: #3498db;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    
    .required-indicator {
        color: #e74c3c;
        font-size: 1.25rem;
        font-weight: bold;
    }
    
    .field-details {
        margin-bottom: 1rem;
    }
    
    .detail-row {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    
    .detail-row strong {
        color: #34495e;
        margin-right: 0.5rem;
    }
    
    .detail-row code {
        background-color: #f8f9fa;
        padding: 0.125rem 0.25rem;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
    }
    
    .monday-type {
        background-color: #ecf0f1;
        padding: 0.125rem 0.25rem;
        border-radius: 3px;
        font-size: 0.85rem;
    }
    
    .field-options {
        border-top: 1px solid #ecf0f1;
        padding-top: 1rem;
    }
    
    .field-options strong {
        color: #34495e;
        margin-bottom: 0.5rem;
        display: block;
    }
    
    .options-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #e1e8ed;
        border-radius: 4px;
        padding: 0.5rem;
    }
    
    .option-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0;
        font-size: 0.85rem;
    }
    
    .option-index {
        background-color: #95a5a6;
        color: white;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 0.75rem;
        flex-shrink: 0;
    }
    
    .option-value {
        flex: 1;
        font-weight: 500;
    }
    
    .color-swatch {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        flex-shrink: 0;
    }
    
    .option-img {
        font-size: 0.75rem;
        color: #7f8c8d;
    }
    
    .summary-section {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 2px solid #3498db;
    }
    
    .summary-section h2 {
        color: #34495e;
        margin-bottom: 1.5rem;
    }
    
    .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid #e1e8ed;
    }
    
    .stat-card h3 {
        margin: 0 0 0.5rem 0;
        color: #7f8c8d;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #3498db;
    }
</style>