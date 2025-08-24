#!/bin/bash
set -e

EXTENSION_NAME="$1"
SUBMODULE_PATH="$2"
TARGET_VERSION="$3"
REPO_NAME="$4"

if [[ -z "$EXTENSION_NAME" || -z "$SUBMODULE_PATH" || -z "$TARGET_VERSION" || -z "$REPO_NAME" ]]; then
    echo "Usage: $0 <extension_name> <submodule_path> <target_version> <repo_name>"
    exit 1
fi

echo "Syncing extension: $EXTENSION_NAME"
echo "Submodule path: $SUBMODULE_PATH"
echo "Target version: $TARGET_VERSION"
echo "Repository: $REPO_NAME"

# Function to get version from extension.toml
get_extension_version() {
    local path="$1"
    if [[ -f "$path/extension.toml" ]]; then
        grep '^version = ' "$path/extension.toml" | head -n1 | sed 's/version = \"(.*)\"/\1/'
    fi
}

# Function to find commit with specific version in extension.toml
find_commit_with_version() {
    local submodule_path="$1"
    local target_version="$2"
    
    cd "$submodule_path"
    
    # Fetch latest from remote
    git fetch origin
    
    # Get all commits and check their extension.toml version
    git log --oneline --format="%H" origin/main | while read commit; do
        git checkout "$commit" 2>/dev/null || continue
        current_version=$(get_extension_version ".")
        if [[ "$current_version" == "$target_version" ]]; then
            echo "$commit"
            break
        fi
    done
    
    cd - > /dev/null
}

# Check if submodule exists
if [[ ! -d "$SUBMODULE_PATH" ]]; then
    echo "Error: Submodule path $SUBMODULE_PATH does not exist"
    exit 1
fi

# Initialize and update submodule to get latest commits
git submodule update --init --remote "$SUBMODULE_PATH"

# Find the commit that has the target version
echo "Looking for commit with version $TARGET_VERSION in $SUBMODULE_PATH..."
target_commit=$(find_commit_with_version "$SUBMODULE_PATH" "$TARGET_VERSION")

if [[ -z "$target_commit" ]]; then
    echo "Error: Could not find commit with version $TARGET_VERSION in $SUBMODULE_PATH"
    echo "Available versions in recent commits:"
    
    cd "$SUBMODULE_PATH"
    git log --oneline --format="%H %s" -10 origin/main | while read commit message; do
        git checkout "$commit" 2>/dev/null || continue
        version=$(get_extension_version ".")
        if [[ -n "$version" ]]; then
            echo "  $commit: $version - $message"
        fi
    done
    cd - > /dev/null
    
    exit 1
fi

echo "Found target commit: $target_commit"

# Update submodule to the specific commit
cd "$SUBMODULE_PATH"
git checkout "$target_commit"
cd - > /dev/null

# Update extensions.toml with the new version
update_extensions_toml() {
    local temp_file=$(mktemp)
    local in_target_section=false
    
    while IFS= read -r line; do
        if [[ $line =~ ^\[([^\]]+)\]$ ]]; then
            local section_name="${BASH_REMATCH[1]}"
            if [[ "$section_name" == "$EXTENSION_NAME" ]]; then
                in_target_section=true
            else
                in_target_section=false
            fi
            echo "$line" >> "$temp_file"
        elif [[ $in_target_section == true && $line =~ ^version[[:space:]]*=[[:space:]]*[\"'](.*)[\"']*$ ]]; then
            echo "version = \"$TARGET_VERSION\"" >> "$temp_file"
            echo "Updated extensions.toml: $EXTENSION_NAME version → $TARGET_VERSION"
        else
            echo "$line" >> "$temp_file"
        fi
    done < extensions.toml
    
    mv "$temp_file" extensions.toml
}

# Update the extensions.toml file
update_extensions_toml

# Verify the submodule is at the correct commit
current_commit=$(cd "$SUBMODULE_PATH" && git rev-parse HEAD)
if [[ "$current_commit" == "$target_commit" ]]; then
    echo "✓ Submodule successfully updated to commit $target_commit"
else
    echo "✗ Warning: Submodule commit mismatch. Expected: $target_commit, Got: $current_commit"
fi

# Verify the version in the submodule matches
actual_version=$(get_extension_version "$SUBMODULE_PATH")
if [[ "$actual_version" == "$TARGET_VERSION" ]]; then
    echo "✓ Version verification successful: $actual_version"
else
    echo "✗ Warning: Version mismatch. Expected: $TARGET_VERSION, Got: $actual_version"
fi

# Stage the changes
git add "$SUBMODULE_PATH" extensions.toml

echo "Successfully synced $EXTENSION_NAME to version $TARGET_VERSION (commit: $target_commit)"
