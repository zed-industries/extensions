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
