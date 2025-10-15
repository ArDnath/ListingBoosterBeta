# Environment Variables Setup

## Required Dependencies

First, install the Google Generative AI package:

```bash
npm install @google/generative-ai
```

## API Configuration

### 1. Get Your API Keys

#### Remove.bg (Background Removal)
- Visit [remove.bg](https://www.remove.bg/api)
- Sign up for a free account (50 free API calls/month)
- Get your API key from the dashboard

#### Google Gemini (AI Description Generation)
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Sign in with your Google account
- Click "Get API Key" or "Create API Key"
- Copy your API key (free tier includes generous quotas)

### 2. Create `.env.local` file
Create a file named `.env.local` in the root of your project with:

```bash
# Remove.bg API Key for background removal
REMOVE_BG_API_KEY=your_removebg_key_here

# Google Gemini API Key for AI-generated descriptions
GEMINI_API_KEY=your_gemini_key_here
```

Replace the placeholder values with your actual API keys.

### 3. Restart Development Server
After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Testing the Integration

### Background Removal
1. Upload a product image in the left panel
2. Click the "Remove Background" button
3. The processed image will appear side-by-side with the original
4. Download the processed image using the "Download" button

### AI Description Generation
1. Fill in the product details form on the right panel
2. Enter at least the product name and key features
3. Click "Generate Description"
4. Copy the SEO-optimized description to your clipboard

## Usage Limits

### Free Tier Limitations
- **AI Descriptions**: 5 free generations, then requires subscription
- **Remove.bg**: 50 API calls per month (free tier)
- **Google Gemini**: Free tier includes 60 requests per minute

### After 5 Generations
Users will see a paywall modal prompting them to upgrade for unlimited generations.

## Troubleshooting

- **"Remove.bg API key not configured"**: Make sure your `.env.local` file exists and contains `REMOVE_BG_API_KEY`
- **"Gemini API key not configured"**: Add `GEMINI_API_KEY` to your `.env.local` file
- **"Failed to remove background"**: Check your Remove.bg API quota
- **"Failed to generate description"**: Verify your Gemini API key is valid and active
- **Network errors**: Ensure you have internet connectivity

## API Limits & Pricing

### Remove.bg
- Free tier: 50 API calls per month
- Image size: Up to 12 megapixels
- Result format: PNG with transparent background

### Google Gemini
- Gemini 1.5 Flash model used for descriptions
- Free tier: 60 requests per minute, 1,500 requests per day
- No credit card required for free tier
- Extremely cost-effective for production use
