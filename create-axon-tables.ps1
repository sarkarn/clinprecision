# Quick script to create Axon Framework event store tables
# Run this to add the missing tables to your database

Write-Host "Creating Axon Framework event store tables..." -ForegroundColor Cyan

# Database connection settings
$Server = "localhost"
$Database = "clinprecisiondb"
$Username = "clinprecadmin"
$Password = "passw0rd"

# Path to SQL script
$SqlScript = ".\backend\clinprecision-db\ddl\create_axon_tables.sql"

# Check if MySQL client is available
$mysqlPath = "mysql"
if (Get-Command mysql -ErrorAction SilentlyContinue) {
    Write-Host "MySQL client found" -ForegroundColor Green
} else {
    Write-Host "ERROR: MySQL client not found in PATH" -ForegroundColor Red
    Write-Host "Please install MySQL client or add it to your PATH" -ForegroundColor Yellow
    exit 1
}

# Run the SQL script
Write-Host "Executing SQL script..." -ForegroundColor Yellow
& $mysqlPath -h $Server -u $Username -p$Password $Database < $SqlScript

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Axon Framework tables created successfully!" -ForegroundColor Green
    Write-Host "`nCreated tables:" -ForegroundColor Cyan
    Write-Host "  - domain_event_entry (stores domain events)" -ForegroundColor White
    Write-Host "  - snapshot_event_entry (stores snapshots)" -ForegroundColor White
    Write-Host "  - association_value_entry (saga associations)" -ForegroundColor White
    Write-Host "  - token_entry (event processor tracking)" -ForegroundColor White
    Write-Host "  - saga_entry (saga instances)" -ForegroundColor White
} else {
    Write-Host "`n✗ Failed to create tables" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
}
