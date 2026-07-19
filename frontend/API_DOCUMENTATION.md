# AI Stylist API Documentation

## Overview
The AI stylist frontend sends user preferences to your backend and expects personalized outfit recommendations in return.

## API Endpoint

### POST `/api/stylist/recommendations`

**Request Body:**
```json
{
  "budget": 500,
  "occasion": "casual",
  "season": "summer",
  "colors": ["#000000", "#FFFFFF", "#808080"],
  "height": 170,
  "body_type": "athletic",
  "skin_tone": "medium",
  "style_preference": "minimal",
  "gender": "women",
  "user_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response Body:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": 1,
      "name": "Elegant Summer Dress",
      "price": 129,
      "image": "https://example.com/dress1.jpg",
      "matchScore": 98,
      "reason": "Perfect match for your style preference and occasion",
      "description": "A flowing summer dress made from premium breathable fabric",
      "sizes": ["XS", "S", "M", "L", "XL"],
      "colors": ["White", "Beige", "Navy"]
    }
  ]
}
```

## Data Fields Explained

### Input Fields:
- **budget** (number): Maximum budget per outfit (50-2000)
- **occasion** (string): One of: casual, office, party, wedding, date, sport
- **season** (string): One of: spring, summer, autumn, winter
- **colors** (array): Array of hex color codes user prefers
- **height** (number): User height in centimeters (140-210)
- **body_type** (string): One of: athletic, pear, apple, hourglass, rectangle
- **skin_tone** (string): One of: fair, light, medium, olive, tan, deep
- **style_preference** (string): One of: minimal, streetwear, formal, sporty, bohemian, classic
- **gender** (string): One of: women, men, unisex
- **user_image** (string, optional): Base64 encoded image if user uploaded photo

### Response Fields:
- **success** (boolean): Whether the request was successful
- **recommendations** (array): Array of recommended products
  - **id** (number): Unique product identifier
  - **name** (string): Product name
  - **price** (number): Product price
  - **image** (string): Product image URL
  - **matchScore** (number): AI match score (0-100)
  - **reason** (string): Why this was recommended
  - **description** (string): Product description
  - **sizes** (array): Available sizes
  - **colors** (array): Available colors

## Frontend Flow

1. User completes questionnaire (8 questions)
2. Optional: User uploads photo
3. Frontend sends all data to `/api/stylist/recommendations`
4. Backend processes and returns recommendations
5. Frontend displays recommendations with match scores
6. User can add items to cart or view details

## Error Handling

If the backend is unavailable or returns an error, the frontend will:
- Show error in console
- Fall back to mock recommendations
- Still display the recommendations page

## Testing

You can test the integration by:
1. Starting the frontend: `npm run dev`
2. Navigate to `/stylist`
3. Complete the questionnaire
4. Check browser console for API calls and responses
