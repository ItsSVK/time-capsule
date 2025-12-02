#!/bin/bash

# Script to reset the Program ID across the entire application
# This will generate a new Program ID and update all references

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Resetting Program ID for Time Capsule${NC}"
echo ""

# Check if solana CLI is installed
if ! command -v solana-keygen &> /dev/null; then
    echo -e "${RED}❌ Error: solana-keygen is not installed${NC}"
    echo "Please install Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Check if anchor is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Error: anchor is not installed${NC}"
    echo "Please install Anchor: https://www.anchor-lang.com/docs/installation"
    exit 1
fi

# Generate new keypair for the program
echo -e "${YELLOW}📝 Generating new Program ID...${NC}"
TEMP_KEYPAIR=$(mktemp)
solana-keygen new --outfile "$TEMP_KEYPAIR" --no-bip39-passphrase --force > /dev/null 2>&1

# Extract the public key (Program ID)
NEW_PROGRAM_ID=$(solana-keygen pubkey "$TEMP_KEYPAIR")

echo -e "${GREEN}✅ New Program ID: ${NEW_PROGRAM_ID}${NC}"
echo ""

# Get the current Program ID from Anchor.toml
OLD_PROGRAM_ID=$(grep -A1 "\[programs.localnet\]" Anchor.toml \
  | grep 'time_capsule' \
  | sed -E 's/.*= "(.*)"/\1/')

echo -e "${YELLOW}📝 Old Program ID: ${OLD_PROGRAM_ID}${NC}"
echo ""

echo -e "${YELLOW}📝 Updating files...${NC}"

# 1. Update Anchor.toml
if [ -f "Anchor.toml" ]; then
    echo "  - Updating Anchor.toml"
    # Update localnet
    sed -i.bak "s/time_capsule = \".*\"/time_capsule = \"${NEW_PROGRAM_ID}\"/g" Anchor.toml
    # Update devnet (if exists)
    sed -i.bak "s/time_capsule = \".*\"/time_capsule = \"${NEW_PROGRAM_ID}\"/g" Anchor.toml
    rm -f Anchor.toml.bak
else
    echo -e "${RED}  ⚠️  Warning: Anchor.toml not found${NC}"
fi

# 2. Update programs/time-capsule/src/lib.rs
LIB_RS="programs/time-capsule/src/lib.rs"
if [ -f "$LIB_RS" ]; then
    echo "  - Updating $LIB_RS"
    sed -i.bak "s/declare_id!(\".*\")/declare_id!(\"${NEW_PROGRAM_ID}\")/g" "$LIB_RS"
    rm -f "$LIB_RS.bak"
else
    echo -e "${RED}  ⚠️  Warning: $LIB_RS not found${NC}"
fi

# 3. Update app/lib/solana/constants.ts
CONSTANTS_TS="app/lib/solana/constants.ts"
if [ -f "$CONSTANTS_TS" ]; then
    echo "  - Updating $CONSTANTS_TS"
    sed -i.bak "s/'${OLD_PROGRAM_ID}'/'${NEW_PROGRAM_ID}'/g" "$CONSTANTS_TS"
    rm -f "$CONSTANTS_TS.bak"
else
    echo -e "${RED}  ⚠️  Warning: $CONSTANTS_TS not found${NC}"
fi

# 4. Update app/lib/solana/idl.json (if it exists)
IDL_JSON="app/lib/solana/idl.json"
if [ -f "$IDL_JSON" ]; then
    echo "  - Updating $IDL_JSON"
    sed -i.bak "s/\"address\": \"${OLD_PROGRAM_ID}\"/\"address\": \"${NEW_PROGRAM_ID}\"/g" "$IDL_JSON"
    rm -f "$IDL_JSON.bak"
else
    echo -e "${YELLOW}  ℹ️  Note: $IDL_JSON not found (will be regenerated on build)${NC}"
fi

# 5. Update the keypair file (if it exists)
KEYPAIR_FILE="target/deploy/time_capsule-keypair.json"
if [ -f "$KEYPAIR_FILE" ]; then
    echo "  - Updating keypair file"
    cp "$TEMP_KEYPAIR" "$KEYPAIR_FILE"
    echo -e "${GREEN}    ✅ Keypair updated${NC}"
else
    # Create the directory if it doesn't exist
    mkdir -p target/deploy
    cp "$TEMP_KEYPAIR" "$KEYPAIR_FILE"
    echo -e "${GREEN}    ✅ Keypair created${NC}"
fi

# Clean up temp file
rm -f "$TEMP_KEYPAIR"

echo ""
echo -e "${GREEN}✅ Program ID reset complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "  Old Program ID: ${OLD_PROGRAM_ID}"
echo "  New Program ID: ${NEW_PROGRAM_ID}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Run 'anchor build' to rebuild the program with the new ID"
echo "  2. Run 'anchor deploy' to deploy the program (if needed)"
echo "  3. The IDL will be automatically updated after building"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "  - All existing on-chain data will be inaccessible with the new Program ID"
echo "  - This is a fresh start - you'll need to redeploy and recreate capsules"
echo ""

# Ask if user wants to build now
read -p "Do you want to build the program now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}🔨 Building program...${NC}"
    anchor build 2>&1 | tail -n 5
    echo ""
    echo -e "${GREEN}✅ Build complete!${NC}"
    echo ""
    echo -e "${YELLOW}📝 The IDL has been updated automatically${NC}"
    echo "  Location: target/idl/time_capsule.json"
    echo ""
    echo -e "${YELLOW}💡 Tip: Copy the new IDL to app/lib/solana/idl.json if needed${NC}"
fi

echo ""
echo -e "${GREEN}✨ Done!${NC}"

