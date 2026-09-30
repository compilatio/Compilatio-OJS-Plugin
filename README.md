# Letimio Plugin for OJS

The Letimio plugin connects a journal running on **Open Journal Systems (OJS)** to Letimio services.

It helps editorial teams integrate similarity detection into their OJS environment and easily define the analysis rules applied to their journal.

> Letimio is a commercial service. An active Letimio subscription and a valid API key are required to use this plugin.

## Who is this plugin for?

This plugin is designed for people who manage an OJS journal, including:

- journal managers;
- editorial teams;
- institutions that want to use Letimio from OJS.

No development knowledge is required to configure the plugin from the OJS interface.

## Main features

Available detections may include:

- similarity detection;
- AI-generated content detection;
- rewording detection;
- unrecognized text language detection;
- spell checking.

The availability of these options depends on your Letimio subscription. Features that are not included in your plan remain visible, disabled, and clearly identified in the interface.

## Requirements

Before installing the plugin, make sure you have:

- a compatible OJS installation;
- an account with permission to manage the journal;
- an active Letimio subscription;
- the API key provided by Letimio.

This version of the plugin is designed for **OJS 3.5**.

## Installation from the OJS interface

1. Download the Letimio plugin installation package.
2. Sign in to OJS with an administrator account.
3. Open the plugin management page.
4. Select the option to upload a new plugin.
5. Select the Letimio package and start the installation.
6. Enable the plugin when the installation is complete.

If OJS requests a database upgrade, follow the instructions displayed in the interface before using the plugin.

## Configuration

Find **Letimio** in the list of installed plugins and open its settings.

### 1. API key

Enter the API key associated with your Letimio account and save. This key allows OJS to communicate securely with the service.

### 2. Similarity thresholds

Define two levels between 0 and 100%:

- the **warning threshold**, set to 10% by default;
- the **critical threshold**, set to 20% by default.

The critical threshold must always be greater than or equal to the warning threshold.

### 3. Starting analyses

Select the desired behavior:

- **Manual**: an authorized person starts the analysis;
- **Automatic**: the analysis starts automatically when the document is ready;
- **Scheduled**: the analysis starts at the selected date and time.

### 4. Analysis options

The detections included in your subscription are displayed in this section.

Some options may be configurable, enforced by the subscription, or unavailable. When a detection is not included in your plan, it appears disabled with the message **“Not included in your subscription.”**

### 5. Saving the configuration

Select **Save settings**. OJS checks the API key and saves the journal configuration.

## Primary Letimio account

During the initial configuration, the first OJS user to save a valid API key becomes the reference Letimio account for the journal.

This primary account is retained to ensure a stable configuration. It is not replaced when another journal manager later updates the plugin settings.

## Need help?

For questions about:

- your subscription;
- your API key;
- available features;
- connecting OJS to Letimio;

contact Letimio support at **support@letimio.net**.

Official website: [https://www.Letimio.net](https://www.Letimio.net)

To report a security vulnerability, please also contact **support@letimio.net** and avoid publishing sensitive information in a public issue.

## Information

- Plugin version: **1.0.0.6**
- Platform: **Open Journal Systems 3.5**
- Publisher: **Letimio**
- License: **GNU GPL v3 or later**

Copyright © 2026 Letimio.
