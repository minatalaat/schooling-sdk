# Set version number
$version = (Get-Content qaema/package.json) -join "`n" | ConvertFrom-Json | Select-Object -ExpandProperty "version"
Write-Output "##vso[task.setvariable variable=qaema.tag.name]qaema.v.$version"

# Get the environment
$variableGroupId = $env:PROD_ENV_GROUP

# Get the variable group
$orgName = "https://dev.azure.com/EJADA-CLOUD/"
$projectName = "ARB-Accounting-Solution"
$variableGroup = az pipelines variable-group show --group-id $variableGroupId --org $orgName --project $projectName --query "variables" | ConvertFrom-Json

# Create or overwrite the .env file
$envFilePath = "qaema/.env"
$envFileContent = ""
foreach ($variable in $variableGroup.PSObject.Properties) {
    $envFileContent += "$($variable.Name)=$($variable.Value.value)`n"
}
$envFileContent | Out-File -FilePath $envFilePath -Encoding utf8