#!/bin/bash

API_URL="http://localhost:8787"
API_KEY="charli_pcm_gfoty_9Kj0uVx8tM4Hc1SgE6rW3QbZ2nP7fD5yLa"

echo "🚀 Quick POST Test - All Endpoints"
echo "==================================="
echo ""

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s -o /dev/null -w "%{http_code}" "${API_URL}/CheckBan?key=${API_KEY}&id=1" > /dev/null 2>&1; then
    echo "❌ Server not running!"
    echo ""
    echo "Please start the server first:"
    echo "  npm run dev"
    echo ""
    echo "Or update API_URL if testing production"
    exit 1
fi
echo "✅ Server is running!"
echo ""

# 1. Ban Player
echo "1️⃣  Banning player..."
curl -s -X POST "${API_URL}/BannedPlayers2?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"name":"TestUser","reason":"Testing"}'
echo -e "\n"

# 2. Set Staff Data
echo "2️⃣  Setting staff data..."
curl -s -X POST "${API_URL}/StaffData?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"c":3,"d":0,"r":55,"s":2}'
echo -e "\n"

# 3. Set Quality Data (DPI)
echo "3️⃣  Setting DPI quality data..."
curl -s -X POST "${API_URL}/QualityData?key=${API_KEY}&game=dpi" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"q":150,"t":8.5,"l":1234567890,"r":5}'
echo -e "\n"

# 4. Set Quality Data (LBE)
echo "4️⃣  Setting LBE quality data..."
curl -s -X POST "${API_URL}/QualityData?key=${API_KEY}&game=lbe" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"q":200,"t":10,"l":1234567890,"r":8}'
echo -e "\n"

# 5. Set Trained (DPI)
echo "5️⃣  Marking trained in DPI..."
curl -s -X POST "${API_URL}/Trained?key=${API_KEY}&game=dpi" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"trained":true}'
echo -e "\n"

# 6. Set Trained (LBE)
echo "6️⃣  Marking trained in LBE..."
curl -s -X POST "${API_URL}/Trained?key=${API_KEY}&game=lbe" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"trained":true}'
echo -e "\n"

# 7. Set Stars (DPI)
echo "7️⃣  Setting DPI stars to 3..."
curl -s -X POST "${API_URL}/Stars?key=${API_KEY}&game=dpi" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"stars":3}'
echo -e "\n"

# 8. Set Stars (LBE)
echo "8️⃣  Setting LBE stars to 2..."
curl -s -X POST "${API_URL}/Stars?key=${API_KEY}&game=lbe" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"stars":2}'
echo -e "\n"

# 9. Create Ward
echo "9️⃣  Creating holy ward..."
curl -s -X POST "${API_URL}/Wards?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id":"Ward1","nurse":5,"patient":10,"day":1,"datetime":1234567890}'
echo -e "\n"

# 10. Add Warning
echo "🔟 Adding warning..."
curl -s -X POST "${API_URL}/Warnings?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"reason":"Test warning","issuer":"Admin"}'
echo -e "\n"

# 11. Add to Blacklist
echo "1️⃣1️⃣  Adding to blacklist..."
curl -s -X POST "${API_URL}/Blacklist?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id":12345,"reason":"Test blacklist","issuer":"Admin"}'
echo -e "\n"

echo "✅ All POST requests completed!"
echo ""
echo "Now verify the data with GET requests:"
echo "  curl -s '${API_URL}/CheckBan?key=${API_KEY}&id=12345'"
echo "  curl -s '${API_URL}/StaffData?key=${API_KEY}&id=12345'"
echo "  curl -s '${API_URL}/Stars?key=${API_KEY}&game=dpi&id=12345'"