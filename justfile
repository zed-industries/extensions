# Packages the extensions.
package-extensions:
    pnpm package-extensions

# Sorts the extensions.
sort-extensions:
    pnpm sort-extensions

# Initializes the submodule at the given path.
init-submodule SUBMODULE_PATH:
    git submodule update --init --recursive {{SUBMODULE_PATH}}

# Updates the Git submodules containing extensions.
submodules:
    git submodule update --init --recursive

# Cleans all of the Git submodules containing extensions.
clean-submodules:
    git submodule deinit --force .

# Resets all of the Git submodules containing extensions.
reset-submodules: clean-submodules
    git submodule update --init --recursive

# Update the submodule at the given path to the given commit hash.
update-submodule SUBMODULE_PATH COMMIT_HASH:
    git submodule update --init --recursive {{SUBMODULE_PATH}}
    git -C {{SUBMODULE_PATH}} checkout {{COMMIT_HASH}}

# Bumps the submodule at the given path to the latest commit on its default branch and stages the change.
bump-submodule SUBMODULE_PATH:
    git submodule update --init --recursive {{SUBMODULE_PATH}}
    git -C {{SUBMODULE_PATH}} fetch origin
    git -C {{SUBMODULE_PATH}} checkout origin/HEAD
    git add {{SUBMODULE_PATH}}
    @echo ""
    @echo "Bumped {{SUBMODULE_PATH}} to $(git -C {{SUBMODULE_PATH}} rev-parse --short HEAD)."
    @echo "Submodule extension.toml version: $(grep '^version' {{SUBMODULE_PATH}}/extension.toml || echo '<not found>')"
    @echo "If the version changed, remember to bump the matching entry in extensions.toml."
