targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Name of the resource group')
param resourceGroupName string = 'rg-${environmentName}'

@description('Supabase URL for the application')
param supabaseUrl string = ''

@description('Supabase Anonymous Key for the application')
param supabaseAnonKey string = ''

// Generate a unique token for resource names
var resourceToken = uniqueString(subscription().id, location, environmentName)

// Create resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Deploy resources in the resource group
module resources 'resources.bicep' = {
  name: 'resources'
  scope: resourceGroup
  params: {
    location: location
    environmentName: environmentName
    resourceToken: resourceToken
    supabaseUrl: supabaseUrl
    supabaseAnonKey: supabaseAnonKey
  }
}

// Outputs
output RESOURCE_GROUP_ID string = resourceGroup.id
output STATIC_WEB_APP_URL string = resources.outputs.STATIC_WEB_APP_URL
output STATIC_WEB_APP_NAME string = resources.outputs.STATIC_WEB_APP_NAME
output STATIC_WEB_APP_API_TOKEN string = resources.outputs.STATIC_WEB_APP_API_TOKEN
