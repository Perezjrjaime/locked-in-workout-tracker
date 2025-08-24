@description('Primary location for all resources')
param location string

@description('Name of the environment')
param environmentName string

@description('Resource token for unique naming')
param resourceToken string

@description('Supabase URL for the application')
param supabaseUrl string

@description('Supabase Anonymous Key for the application')
param supabaseAnonKey string

// Resource prefix (max 3 characters)
var resourcePrefix = 'swa'

// Create Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'az-${resourcePrefix}-${resourceToken}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Create Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'az-${resourcePrefix}-${resourceToken}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Create User-assigned Managed Identity
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'az-${resourcePrefix}-${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// Create Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'az-${resourcePrefix}-${resourceToken}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
  }
  tags: {
    'azd-env-name': environmentName
  }
}

// Assign Key Vault Secrets Officer role to managed identity
resource keyVaultRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: keyVault
  name: guid(keyVault.id, managedIdentity.id, 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7') // Key Vault Secrets Officer
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Store Supabase secrets in Key Vault
resource supabaseUrlSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (supabaseUrl != '') {
  parent: keyVault
  name: 'VITE-SUPABASE-URL'
  properties: {
    value: supabaseUrl
  }
}

resource supabaseAnonKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (supabaseAnonKey != '') {
  parent: keyVault
  name: 'VITE-SUPABASE-ANON-KEY'
  properties: {
    value: supabaseAnonKey
  }
}

// Create Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: 'az-${resourcePrefix}-${resourceToken}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      skipGithubActionWorkflowGeneration: false
      appBuildCommand: 'npm run build'
      outputLocation: 'dist'
      appLocation: '/'
    }
    repositoryUrl: ''
    branch: 'master'
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  tags: {
    'azd-service-name': 'workout-tracker-frontend'
    'azd-env-name': environmentName
  }
}

// Configure application settings for Static Web App
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    VITE_SUPABASE_URL: supabaseUrl != '' ? '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=VITE-SUPABASE-URL)' : ''
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey != '' ? '@Microsoft.KeyVault(VaultName=${keyVault.name};SecretName=VITE-SUPABASE-ANON-KEY)' : ''
  }
}

// Outputs
output STATIC_WEB_APP_URL string = 'https://${staticWebApp.properties.defaultHostname}'
output STATIC_WEB_APP_NAME string = staticWebApp.name
output KEY_VAULT_NAME string = keyVault.name
output MANAGED_IDENTITY_CLIENT_ID string = managedIdentity.properties.clientId
