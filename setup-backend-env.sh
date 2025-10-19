#!/bin/bash

# Backend Environment Variables Setup Script
# Generated from Vly for Git Sync
# Run this script to set up your Convex backend environment variables

echo 'Setting up Convex backend environment variables...'

# Check if Convex CLI is installed
if ! command -v npx &> /dev/null; then
    echo 'Error: npx is not installed. Please install Node.js and npm first.'
    exit 1
fi

echo "Setting GEMINI_API_KEY..."
npx convex env set "GEMINI_API_KEY" -- "AIzaSyA5ZMIfzTUw2pDXC3OMUNXdS-46w-rwBKI"

echo "Setting JWKS..."
npx convex env set "JWKS" -- "{\"keys\":[{\"use\":\"sig\",\"kty\":\"RSA\",\"n\":\"rEAKZX5phJhlx2yYgFymywCq-4AurrMhMqwzB-RJooky1-M82p1qaRAl_1axJ5_kL-sjiwYqA0QFJladbjvobT_kcBUdPX-R1CJXLfg7h4w6rnSUeE_hJw7k4Z5ZhJTH2Vl_NK-wp6dVkUHdpZ_dQBEAB8XBNbTNRkeqMcqouQvAb_xzRQbBMz51hE4FstSVUvR9yLqSs0p0V6iX0M79s1RDUXKyT8g5CoCUBsMFsO_ugTN6kGBm3CyRYzbfThE1WN4eqQM5ICXJQWVcv6G1QYcfIBnn-J903eWuIIl9bCxu5leR3usV8DUoNdg5BzjLt2ZYXaYwOg5z3gcC4fefCw\",\"e\":\"AQAB\"}]}"

echo "Setting JWT_PRIVATE_KEY..."
npx convex env set "JWT_PRIVATE_KEY" -- "-----BEGIN PRIVATE KEY----- MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCsQAplfmmEmGXH bJiAXKbLAKr7gC6usyEyrDMH5EmiiTLX4zzanWppECX/VrEnn+Qv6yOLBioDRAUm Vp1uO+htP+RwFR09f5HUIlct+DuHjDqudJR4T+EnDuThnlmElMfZWX80r7Cnp1WR Qd2ln91AEQAHxcE1tM1GR6oxyqi5C8Bv/HNFBsEzPnWETgWy1JVS9H3IupKzSnRX qJfQzv2zVENRcrJPyDkKgJQGwwWw7+6BM3qQYGbcLJFjNt9OETVY3h6pAzkgJclB ZVy/obVBhx8gGef4n3Td5a4giX1sLG7mV5He6xXwNSg12DkHOMu3ZlhdpjA6DnPe BwLh958LAgMBAAECggEANogfwnn+1eeZcUVEEn9CnsobV3wBS3WScQRrM3hmh3qA CjD6twtXAOQH44qCk1TfXPxISF8vNdF2/+gz9w4oS04K+CD3HN0iQdKNXxRTZFpU yZ5G0sAXO9JPS85h8MNZccoPp5Jnjuw+/rmnfiPaW8oGBG/q9yHCSxmtHA5Y1BwL KHEd+nPYA6xU8N0ImgxwbJLE5QnLhKuGzMeDwBkltr/sYBjtKl26o688/XaH+6JZ d8imm3cDPN4T/TcctjelLPpHBYaz7R5WtFmwS8/8nHPYL7yK/BJLigxm2BU+MH7j tNLMoi2dYzfIXuzp8JKLF62hyb6GSRNcQrdKPB34QQKBgQDeInxPM8O06yV7nS9j KJMkFLdh+YCsE/JVBfhx3Uz7nLJf1VpyOio7HcqIoKW6LPY3XmXvloNkJHaGv2cs e+/vcI1ahJZE5hSJpV0xOoF28U+wLQyLsTHw0MSZvGe9PI85GjZUk+0/MlaQxdIs H6TiCWgNn3lCWRzGu1fxaY7QWQKBgQDGgqbN/8SfHb9XaggpI+HcuVaCBjkOE0n2 2EwzFY0XKfWBXlFvq6rcZU87Q4Xob12xe7aDq5FRPdbmnr0qvCm4WiIHHkjPELrh gd6OdOKLpVjJ9rIFjmIerHH1yRv/YyBkGFnhSOQU0aVlKWHKAun9l2FT4Y7+3If+ GZu1rc7eAwKBgQC5lFYGVVjLbSiDfW55iQxkuGn8kFXPbVqnbbWCa0BFdUQQjE5j 3/QoL1tlidDrGWUaHONMppJet5fOO1oW7/QkNgPh+6MPLKk71ctltVsz46aPqRMy IXd3mPKm/aAtmMqPCjcZsfwjMAriKGLOOiGmNfWYbAMCSzCfVyTBq06FAQKBgFej NIr7YM2yb1fjKskm2z7739I1dxjcsSm2IiXnXMueLZG4lxFK43q7izgpvkN4bw+9 Az2sD9KjD23vJKpqOaz2tdEYsKIhy69lC2Eu/xkRnVpEfCFx06WhEgqlh6O/Gny2 N2/7Ix6B05gOpepuUOkw3LoQeXXQ3IT0v0Z8/jgLAoGAOPhA3iKvtqXKI8qY6vid tcPVyN4i9k842vWZ/ac/we7gurAhI+wYU5fzHiACv4OsSJdNGYXxEx5DFoyamb1t Igguxizyon84Jk+grqLueQeg7eU8kzaVTHUzKHIUMOUMOMn1jYrpBazSnAJmipsg BvUO+/jjt8knYE/jIW6AHUA"

echo "Setting OPENAI_API_KEY..."
npx convex env set "OPENAI_API_KEY" -- "sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop"

echo "Setting SITE_URL..."
npx convex env set "SITE_URL" -- "http://localhost:5173"

echo "Setting VLY_APP_NAME..."
npx convex env set "VLY_APP_NAME" -- "GitHub Access"

echo "✅ All backend environment variables have been set!"
echo "You can now run: pnpm dev:backend"
