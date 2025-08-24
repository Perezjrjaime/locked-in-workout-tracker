# Google OAuth Setup Instructions

## 1. Supabase Configuration

In your Supabase Dashboard:

1. Go to **Authentication > Providers**
2. Find **Google** and click to enable it
3. Add your Google OAuth credentials:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret

4. In **Authentication > Settings**:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: Add both:
     - `http://localhost:5173`
     - `https://your-app-name.azurestaticapps.net` (when you deploy)

## 2. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials > Create Credentials > OAuth client ID**
5. Choose **Web application**
6. Add **Authorized redirect URIs**:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - Replace `your-supabase-project` with your actual project reference

## 3. Test the Configuration

1. Save this file
2. Run `npm run dev`
3. Try signing in with Google
4. Check browser console for any errors
5. Check Supabase Auth logs in the dashboard

## 4. Troubleshooting

If you see `SIGNED_OUT` events:
- Check that redirect URLs match exactly
- Ensure Google OAuth is enabled in Supabase
- Verify your Google client ID/secret are correct
- Check browser network tab for failed requests

## 5. Current Status

- ✅ Auth context updated with better error handling
- ✅ User profile creation added
- ⚠️  Need to configure Google OAuth in Supabase dashboard
- ⚠️  Need to test sign-in flow
