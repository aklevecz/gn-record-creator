<script>
    // Admin pages configuration
    const adminPages = [
        {
            title: 'Form Fields',
            description: 'Visualize and manage current form field structure',
            href: '/admin/form-fields',
            icon: '📝',
            category: 'Configuration'
        },
        {
            title: 'Database Management',
            description: 'Manage localStorage, cookies, IndexedDB, and survey entries',
            href: '/admin/database-management',
            icon: '🗄️',
            category: 'Data'
        },
        {
            title: 'Monday Board Data',
            description: 'View Monday.com board structure and data',
            href: '/admin/monday-boards-structure',
            icon: '📊',
            category: 'Monday.com'
        },
        {
            title: 'Board 6253075642',
            description: 'View specific Monday board',
            href: '/admin/board/6253075642',
            icon: '📋',
            category: 'Monday.com'
        }
    ];

    // Group pages by category
    const pagesByCategory = adminPages.reduce((/** @type {*}* */ acc, page) => {
        if (!acc[page.category]) {
            acc[page.category] = [];
        }
        acc[page.category].push(page);
        return acc;
    }, {});
</script>

<svelte:head>
    <title>Admin Dashboard - Good Neighbor Record Creator</title>
    <meta name="description" content="Administrative dashboard for managing form fields, database, and Monday.com integration for the Good Neighbor Record Creator application." />
    <meta property="og:title" content="Admin Dashboard - Good Neighbor Record Creator" />
    <meta property="og:description" content="Administrative dashboard for managing form fields, database, and Monday.com integration for the Good Neighbor Record Creator application." />
    <meta property="og:image" content="/characters/carry-blackwhite.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Admin Dashboard - Good Neighbor Record Creator" />
    <meta name="twitter:description" content="Administrative dashboard for managing form fields, database, and Monday.com integration for the Good Neighbor Record Creator application." />
    <meta name="twitter:image" content="/characters/carry-blackwhite.png" />
</svelte:head>

<div class="admin-home">
    <div class="header">
        <h1>Admin Dashboard</h1>
        <p>Manage and monitor your application's data and configuration</p>
    </div>

    {#each Object.entries(pagesByCategory) as [categoryName, pages]}
        <div class="category-section">
            <h2>{categoryName}</h2>
            <div class="pages-grid">
                {#each pages as page}
                    <a href={page.href} class="page-card">
                        <div class="page-icon">{page.icon}</div>
                        <div class="page-content">
                            <h3>{page.title}</h3>
                            <p>{page.description}</p>
                        </div>
                        <div class="page-arrow">→</div>
                    </a>
                {/each}
            </div>
        </div>
    {/each}

    <div class="quick-stats">
        <h2>Quick Overview</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">🎵</div>
                <div class="stat-label">Record Creator</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">📊</div>
                <div class="stat-label">Data Management</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">⚙️</div>
                <div class="stat-label">Configuration</div>
            </div>
        </div>
    </div>
</div>

<style>
    .admin-home {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        background-color: #f8f9fa;
        min-height: 100vh;
        color: #333;
    }

    .header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .header h1 {
        color: #2c3e50;
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }

    .header p {
        color: #7f8c8d;
        font-size: 1.1rem;
    }

    .category-section {
        margin-bottom: 3rem;
    }

    .category-section h2 {
        color: #34495e;
        border-bottom: 2px solid #3498db;
        padding-bottom: 0.5rem;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
    }

    .pages-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
    }

    .page-card {
        display: flex;
        align-items: center;
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        text-decoration: none;
        color: inherit;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid #e1e8ed;
        transition: all 0.3s ease;
    }

    .page-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        border-color: #3498db;
    }

    .page-icon {
        font-size: 2.5rem;
        margin-right: 1rem;
        flex-shrink: 0;
    }

    .page-content {
        flex: 1;
    }

    .page-content h3 {
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
        font-size: 1.25rem;
    }

    .page-content p {
        margin: 0;
        color: #7f8c8d;
        line-height: 1.4;
    }

    .page-arrow {
        font-size: 1.5rem;
        color: #3498db;
        margin-left: 1rem;
        transition: transform 0.3s ease;
    }

    .page-card:hover .page-arrow {
        transform: translateX(4px);
    }

    .quick-stats {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 2px solid #ecf0f1;
    }

    .quick-stats h2 {
        color: #34495e;
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .stat-item {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border: 1px solid #e1e8ed;
    }

    .stat-number {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .stat-label {
        color: #7f8c8d;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.9rem;
    }
</style>
