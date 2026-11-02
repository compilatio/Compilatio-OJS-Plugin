# GitHub installation archives

The GitLab mirror copies the GitHub Actions workflow to both product repositories.
Create a tag on the desired **mirrored GitHub commit**, after the GitLab pipeline
and mirror have succeeded. Tags created only in GitLab are not mirrored.

Every pushed GitHub tag runs `.github/workflows/package.yml`. It reads the product,
class and four-part release from `version.xml`, then packages the compiled assets
already supplied by GitLab. It does not rebuild or transform the product.

The workflow produces:

- `compilatio-VERSION.tar.gz` or `letimio-VERSION.tar.gz`;
- matching `.md5` and `.sha256` checksum files.

The archive contains a single product root directory and tracked runtime files,
including the license, product configuration, translations and compiled assets.
Tests, CI files, secrets and development dependencies are excluded. Missing
required tracked files or compiled assets cause the workflow to fail.

Download `ojs-plugin-package` from the workflow run's **Artifacts** section.
GitHub wraps these files in a ZIP: extract it and use the `.tar.gz` for OJS.
Artifacts expire after 90 days. This workflow does **not** create a release:
attach the archive and checksums to a GitHub Release for a permanent download URL
before submitting the plugin to PKP. Use a new version/tag for each publication;
the archive version is always taken from `version.xml`, not the tag name.

The workflow uses GitHub's automatic token with `contents: read`; no extra secret
is needed. The GitLab mirror token needs permission to write repository contents
and workflows. GitHub Actions must be enabled for the organization/repository.

Run the packaging tests locally with:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s ci/test -p 'test_*.py'
```
