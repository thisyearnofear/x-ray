# API Documentation

## Medical Analysis API

### POST `/api/medical-analysis`

Analyzes medical conditions using Cerebras Llama models.

**Request:**
```json
{
  "condition": "string"
}
```

**Response:**
```json
{
  "choices": [{
    "message": {
      "content": "Medical analysis content..."
    }
  }]
}
```

**Error Response:**
```json
{
  "error": "Analysis failed",
  "fallback": "Please consult a medical professional."
}
```

## Environment Variables

```bash
CEREBRAS_API_KEY=your_api_key_here
```

## Rate Limiting

- API calls are cached for performance
- Fallback responses for failed requests
- 30-second timeout per request
