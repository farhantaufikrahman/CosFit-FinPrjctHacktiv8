#!/usr/bin/env bash
# Smoke test API CosFit.  Jalankan saat `npm run dev` aktif:
#   bash scripts/api-smoke.sh            (default http://localhost:3000)
#   BASE=http://localhost:3000 bash scripts/api-smoke.sh
# Butuh: curl, jq.  Endpoint upload/Midtrans/Fashn hanya dicek validasinya
# (tidak memanggil layanan berbayar).
set -u
BASE="${BASE:-http://localhost:3000}"
JAR_U=$(mktemp); JAR_V=$(mktemp)
SUFFIX=$RANDOM$RANDOM
U_EMAIL="user$SUFFIX@test.dev"; V_EMAIL="vendor$SUFFIX@test.dev"
PASS=0; FAIL=0

check() { # check <nama> <expected-status> <actual-status> [body]
  if [[ "$3" == "$2" ]]; then PASS=$((PASS+1)); printf "  \e[32mPASS\e[0m %-55s %s\n" "$1" "$3"
  else FAIL=$((FAIL+1)); printf "  \e[31mFAIL\e[0m %-55s got %s, want %s  %s\n" "$1" "$3" "$2" "${4:-}"; fi
}
req() { # req <jar|-> <method> <path> [json] -> prints "status<TAB>body"
  local jar=$1 m=$2 p=$3 d=${4:-}
  local args=(-s -o /tmp/_body -w "%{http_code}" -X "$m" "$BASE$p")
  [[ "$jar" != "-" ]] && args+=(-b "$jar" -c "$jar")
  [[ -n "$d" ]] && args+=(-H "Content-Type: application/json" -d "$d")
  local code; code=$(curl "${args[@]}"); printf "%s\t%s" "$code" "$(cat /tmp/_body)"
}
status() { cut -f1 <<<"$1"; }
body()   { cut -f2- <<<"$1"; }

echo "== Auth user"
r=$(req - POST /api/user/register "{\"email\":\"$U_EMAIL\",\"username\":\"tester\",\"password\":\"secret123\"}"); check "register user" 201 "$(status "$r")" "$(body "$r")"
r=$(req - POST /api/user/register "{\"email\":\"$U_EMAIL\",\"username\":\"tester\",\"password\":\"secret123\"}"); check "register duplicate -> 400" 400 "$(status "$r")"
r=$(req - POST /api/user/register '{"email":"bad","username":"x","password":"1"}'); check "register invalid (zod) -> 400" 400 "$(status "$r")"
r=$(req - POST /api/user/login "{\"email\":\"$U_EMAIL\",\"password\":\"wrong\"}"); check "login wrong password -> 401" 401 "$(status "$r")"
r=$(req "$JAR_U" POST /api/user/login "{\"email\":\"$U_EMAIL\",\"password\":\"secret123\"}"); check "login user" 200 "$(status "$r")" "$(body "$r")"
USER_ID=$(curl -s -b "$JAR_U" "$BASE/api/user/profile" | jq -r '.userId[0]._id // empty')

echo "== Security"
r=$(curl -s -o /dev/null -w "%{http_code}" -H "x-user-id: 000000000000000000000000" "$BASE/api/user/token"); check "spoofed x-user-id header ditolak -> 401" 401 "$r"
r=$(curl -s -o /dev/null -w "%{http_code}" -H "Cookie: Authorization=Bearer invalid.jwt.token" "$BASE/api/forum"); check "JWT invalid tidak bikin 500 di route publik" 200 "$r"
r=$(req "$JAR_U" PATCH /api/topup '{"credit":99999}'); check "top up tanpa bayar ditolak -> 400" 400 "$(status "$r")"
r=$(req "$JAR_U" GET /api/admin/events); check "user biasa akses admin API -> 403" 403 "$(status "$r")"
r=$(req "$JAR_U" GET /api/vendor/profile); check "user biasa akses vendor API -> 403" 403 "$(status "$r")"
r=$(req - PUT /api/user/product/000000000000000000000000 '{"title":"hacked"}'); check "PUT product publik sudah dihapus -> 405" 405 "$(status "$r")"

echo "== User endpoints"
r=$(req "$JAR_U" GET /api/user/profile); check "GET profile" 200 "$(status "$r")"
r=$(req "$JAR_U" PUT /api/user/profile '{"address":"Jl. Test 1","_id":"x","userId":"y"}'); check "PUT profile (field liar diabaikan)" 200 "$(status "$r")" "$(body "$r")"
r=$(req "$JAR_U" GET /api/user/token); check "GET token" 200 "$(status "$r")"
r=$(req "$JAR_U" PATCH /api/user/token); check "claim token saat masih punya -> 400" 400 "$(status "$r")"
r=$(req "$JAR_U" GET /api/user/history); check "GET try-on history" 200 "$(status "$r")"
r=$(req "$JAR_U" GET /api/user/wishlist); check "GET wishlist" 200 "$(status "$r")"
r=$(req "$JAR_U" GET /api/user/checkout); check "GET checkout" 200 "$(status "$r")"
r=$(req "$JAR_U" GET /api/pay); check "GET orders" 200 "$(status "$r")"
r=$(req "$JAR_U" POST /api/pay '{"items":[]}'); check "POST pay items kosong -> 400" 400 "$(status "$r")"
r=$(req "$JAR_U" PATCH /api/pay '{"orderId":"nope","status":"Success"}'); check "PATCH pay order orang lain/tdk ada -> 404" 404 "$(status "$r")"

echo "== Public endpoints"
for p in /api/user/product /api/user/product/popular /api/user/product/featured /api/forum "/api/forum?sort=trending" /api/event /api/event/closest /api/userDesign; do
  r=$(req - GET "$p"); check "GET $p" 200 "$(status "$r")"
done
r=$(req - GET /api/forum/slug-yang-tidak-ada); check "GET forum slug tidak ada -> 404" 404 "$(status "$r")"
r=$(req - GET /api/event/bukan-objectid); check "GET event id invalid -> 400" 400 "$(status "$r")"
r=$(req - GET /api/user/product/slug-tidak-ada); check "GET product slug tidak ada -> 404" 404 "$(status "$r")"

echo "== Forum & chat (butuh minimal 1 forum di DB)"
SLUG=$(curl -s "$BASE/api/forum" | jq -r '.[0].slug // empty')
ROOM=$(curl -s "$BASE/api/forum" | jq -r '.[0]._id // empty')
if [[ -n "$SLUG" ]]; then
  r=$(req "$JAR_U" PATCH "/api/forum/$SLUG"); l1=$(body "$r" | jq -r .isLiked); check "like forum" 200 "$(status "$r")"
  r=$(req "$JAR_U" PATCH "/api/forum/$SLUG"); l2=$(body "$r" | jq -r .isLiked)
  [[ "$l1" != "$l2" ]] && check "like lalu unlike (toggle)" ok ok || check "like lalu unlike (toggle)" ok "isLiked=$l1/$l2"
  r=$(req - PATCH "/api/forum/$SLUG"); check "like tanpa login -> 401" 401 "$(status "$r")"
  r=$(req - GET "/api/chat/$ROOM"); check "GET chat (anonim)" 200 "$(status "$r")"
  r=$(req "$JAR_U" POST "/api/chat/$ROOM" '"<p>halo</p><img src=x onerror=alert(1)>"')
  check "POST chat" 201 "$(status "$r")"
  body "$r" | grep -q onerror && check "chat tersanitasi (tanpa onerror)" ok "XSS lolos" || check "chat tersanitasi (tanpa onerror)" ok ok
  body "$r" | grep -q '"password"' && check "chat tidak bocorkan password" ok "bocor" || check "chat tidak bocorkan password" ok ok
  r=$(req "$JAR_U" POST "/api/chat/$ROOM" '"   "'); check "POST chat kosong -> 400" 400 "$(status "$r")"
else
  echo "  (skip: belum ada forum)"
fi

echo "== Product & wishlist (butuh minimal 1 product di DB)"
PID=$(curl -s "$BASE/api/user/product" | jq -r '.[0]._id // empty')
if [[ -n "$PID" ]]; then
  r=$(req "$JAR_U" POST /api/user/wishlist "{\"productId\":\"$PID\"}"); check "add wishlist" 201 "$(status "$r")"
  r=$(req "$JAR_U" POST /api/user/wishlist "{\"productId\":\"$PID\"}"); check "add wishlist lagi (tidak dobel)" 201 "$(status "$r")"
  n=$(curl -s -b "$JAR_U" "$BASE/api/user/wishlist" | jq "[.[] | select(.productId==\"$PID\")] | length")
  check "wishlist product yang sama = 1 baris" 1 "$n"
  r=$(req "$JAR_U" DELETE "/api/user/wishlist/$PID"); check "delete wishlist via productId" 200 "$(status "$r")"
  r=$(req "$JAR_U" POST /api/user/checkout "{\"productId\":\"$PID\",\"quantity\":1}"); check "add checkout" 201 "$(status "$r")"
  r=$(req "$JAR_U" DELETE "/api/user/checkout/$PID"); check "delete checkout" 200 "$(status "$r")"
  r=$(req - PATCH "/api/user/product/$PID"); check "PATCH view counter" 200 "$(status "$r")"
else
  echo "  (skip: belum ada product)"
fi

echo "== Vendor"
r=$(req - POST /api/vendor/register "{\"namaToko\":\"Toko $SUFFIX\",\"alamat\":\"Bandung\",\"email\":\"$V_EMAIL\",\"password\":\"secret123\"}"); check "register vendor" 201 "$(status "$r")" "$(body "$r")"
r=$(req "$JAR_V" POST /api/vendor/login "{\"email\":\"$V_EMAIL\",\"password\":\"secret123\"}"); check "login vendor" 200 "$(status "$r")"
r=$(req "$JAR_V" GET /api/vendor/profile); check "GET vendor profile" 200 "$(status "$r")"
body "$r" | grep -q '"password"' && check "vendor profile tanpa password" ok "bocor" || check "vendor profile tanpa password" ok ok
r=$(req "$JAR_V" PUT /api/vendor/profile '{"alamat":"Jakarta","role":"Admin","password":"x"}'); check "PUT vendor profile" 200 "$(status "$r")"
a=$(curl -s -b "$JAR_V" "$BASE/api/vendor/profile" | jq -r '.alamat + "|" + .role')
check "alamat ter-update, role tidak berubah" "Jakarta|Vendor" "$a"
r=$(req "$JAR_V" GET "/api/vendor/product?page=1&limit=4"); check "GET vendor products" 200 "$(status "$r")"
if [[ -n "${PID:-}" ]]; then
  r=$(req "$JAR_V" PUT "/api/vendor/product/$PID" '{"title":"hijack"}'); check "edit product vendor lain -> 403" 403 "$(status "$r")"
fi
r=$(req "$JAR_V" PUT /api/vendor/product/bukan-id '{}'); check "edit product id invalid -> 404" 404 "$(status "$r")"

rm -f "$JAR_U" "$JAR_V" /tmp/_body
echo; echo "Hasil: $PASS pass, $FAIL fail"
[[ $FAIL -eq 0 ]]
