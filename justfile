# Packages the extensions.
package-extensions:
    pnpm package-extensions

# Updates the Git submodules containing extensions.
submodules:
    git submodule update --init --recursive

# Resets all of the Git submodules containing extensions.
reset-submodules:
    git submodule deinit --force .
    git submodule update --init --recursive
