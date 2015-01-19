OMA LWM2M DevKit
================

## About
The OMA LWM2M DevKit is an add-on for the [Mozilla Firefox](https://www.mozilla.org/firefox/) Web browser. It adds support for the [OMA Lightweight M2M protocol](http://technical.openmobilealliance.org/Technical/technical-information/release-program/current-releases/oma-lightweightm2m-v1-0) and enables manual interaction with a LWM2M Server directly from the Web browser.
This way, developers and users can interactively explore and comprehend the new protocol for machine-to-machine communication.

## Features
-  OMA Lightweight M2M 1.0
-  Virtual LWM2M Clients
-  7 OMA-label Objects with descriptions
-  Object Instance and Resource editing
-  Registration Interface
-  Device Management and Service Enablement Interface
-  Information Reporting Interface
-  Logging and visualization of LWM2M operations and their CoAP messages
-  Interactive guide

## Installation
### Release version
The OMA LWM2M DevKit is published on the Mozilla [https://addons.mozilla.org/firefox/addon/oma-lwm2m-devkit/](Add-ons for Firefox) Web site, which provides direct installation.
### Developer version
The developer version uses a cloned Git repository to directly inject the source code. This allows for the latest snapshot versions and customizations of the add-on. The installation process is as follows:
1. Get the sources from Github: `clone git://github.com/OpenMobileAlliance/OMA-LWM2M-DevKit.git`
2. Add a text file named `lwm2m-devkit@openmobilealliance.org` to your profile's extension directory. You can also use the [https://support.mozilla.org/en-US/kb/profile-manager-create-and-remove-firefox-profiles](Profile Manager) to create a new profile for add-on development.
 - Windows: `C:\Users\<username>\AppData\Roaming\Mozilla\Firefox\Profiles\xxxxxxxx.default\extensions\`
 - Linux: `~/.mozilla/firefox/xxxxxxxx.default/extensions/`
 - MacOS: `~/Library/Application Support/Firefox/Profiles/xxxxxxxx.default/extensions/`
5. Write the path to the DevKit sources (i.e., the directory that contains `install.rdf` and `chrome.manifest`) into that file.
6. (Re-)start Firefox and allow the installation of this add-on.

## Usage
### Launching the OMA LWM2M DevKit
- The launcher: After installation, a button with the OMA logo is added to your toolbar. It will open the launcher where you can enter the URI of a LWM2M Server:

  ![Launcher](https://raw.githubusercontent.com/OpenMobileAlliance/OMA-LWM2M-DevKit/master/docs/launcher.png)

- The addressbar: You can also directly enter the URI of an LWM2M Server into the addressbar of the browser:

  ![Web browser addressbar](https://raw.githubusercontent.com/OpenMobileAlliance/OMA-LWM2M-DevKit/master/docs/addressbar.png)
   
  Note that here the pseudo scheme `coap+lwm2m` is used to distinguish the call from raw CoAP handling, for which [Copper (Cu)](https://addons.mozilla.org/firefox/addon/copper-270430/) can be used. Technically, LWM2M still uses `coap` URIs!

### Organization of the GUI

![GUI](https://raw.githubusercontent.com/OpenMobileAlliance/OMA-LWM2M-DevKit/master/docs/gui-annotated.png)

1. If the LWM2M Server responds to CoAP ping, this button turn green. When clicking on it, the LWM2M Client address is shown.
2. All CoAP messages are logged here. The first entries show the CoAP ping exchange (CON-EMPTY/RST-EMPTY).
3. This button opens a menu to load the the virtual LWM2M Client. Once the DevKit is aligned with the LabKit, it will allow the creation of custom LWM2M Clients and Objects. Use the hotkey `E` to directly load the Example Client.
4. This area will show the Objects provided by the LWM2M Client. Currently, the seven OMA-label Objects are supported.
5. This area will either show the Object definitions when selecting an Object at (3) or the Resources when selecting an Instance at (3).
6. The Bootstrap Interface is always disabled. The address of the LWM2M Server is entered by the user, which logically corresponds to a factory bootstrap.
7. The Register Interface allows to register, update, and de-register the Client. The menu also takes input for the registration parameters. The hotkey `R`directly registers the client one it was loaded.
8. The Device Management & Service Enablement Interface menu provides a log of all operations executed by the LWM2M Server. When selecting a log entry, the corresponding CoAP messages are shown.
9. The Information Reporting Interface menu shows the active observe relationships. Below all corresponding operations are logged and can be inspected like in (8).
10. The last button opens the preferences to configure the GUI features and the protocol behavior.

### How to get started
The OMA LWM2M DevKit will provide tooltips that guide through the process. When lost and there is no tooltip showing, press `H` to display the current tooltip.

![Tooltips](https://raw.githubusercontent.com/OpenMobileAlliance/OMA-LWM2M-DevKit/master/docs/tooltips.png)

After the first run, tooltips are disabled. They can be re-enabled again through the preference menu or directly through hotkey `H`.
