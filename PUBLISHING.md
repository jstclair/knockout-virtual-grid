## Publishing a release

1. Decide upon the [next version](http://www.semver.org) of your release.

> NOTE: We don't store the version in `bower.json` (since they pull from the latest published tag), but we **do** put it in `package.json`

2. Edit the `package.json` file, and update the version based on your decision in 1, but do **not** commit it.

3. Follow the steps below to publish a release to GitHub.

```
git add package.json
git add -f out/*
git checkout head
git commit -m "Version {version} for distribution"
git tag -a v{version} -m "Add tag v{verson}"
git checkout master
git push origin --tags
```
