# Dependabot
You can activate usage of Dependabot in GitHub to monitor possible security risks. It goes through all
dependencies found in the main branch, also dependencies of dependencies and their dependencies, and so on down through
a "dependency tree". The main branch contains the code which is already in production, or is used to build this code.
When Dependabot have gone through all dependencies it will tell us if any of the packages we use have a discovered
security risk which we need to evaluate. It will list every package with a security list, with a description of the problem,
which version of the package contains the fix, and details like the number it has in systems like
"Common Vulnerabilities and Exposure" (CVE).

We should make sure the Dependabot alerts are considered continuously.

If there are many alerts, there might be more efficient to consider them as a whole.
This is the most efficient way we have found so far:
1. Update all packages in all package.json with minor and bugfix versions. (Major versions will most likely crash the building of the app)

2. Delete all package-lock.json

3. Delete all node_modules folders

4. Install the dependencies with `make install_new_dependencies`

5. Go through the list of all the security risks Dependabot has found, and check which versions we have of these packages now.
   This can be done by making sure you are in the same folder as the package.json file, and running `npm ls <package name>`.

6. If the versions you get by following the instructions above correlates with the version numbers Dependabot says are patched,
   everything is good.

7. If the versions you get by following the instructions above do not correlate with the version numbers Dependabot says
   are patched, you should:
    1. Check if you can update it in any other way. Maybe the package needs to update to a
       newer major version, in this case investigate the consequences this has for the project and handle it accordingly.
    2. If you can't update it any other way, check if the package is used runtime. If it is not,
       AND MAKE SURE THIS IS CORRECT BEFORE CONTINUING, you can dismiss the
       vulnerability from Dependabot with the reason "Vulnerable code is not actually used".
       YOU WILL NOT BE ABLE TO UNDO THIS!
