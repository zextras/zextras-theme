# Zextras Theme

## Instructions

Here are the instructions to deploy the theme:

1) Download [the zip file](https://github.com/ZeXtras/zextras-theme/archive/master.zip)

2) Extract the content and modify the folder name with the new name `zextras`

3) zip the folder with the comand 

   `zip -r zextras.zip zextras`

4) copy the zip file in `/tmp` and change the user permissions with

   `chown zimbra:zimbra /tmp/zextras.zip`

5) modify the zimbra binary with this command

   `sed -i '/+ZimbraInstalledSkin/d' /opt/zimbra/bin/zmskindeploy`

6) modify jetty configuration with the new theme

   `sed -i 's/harmony/zextras/g' /opt/zimbra/jetty/etc/zimbra.web.xml.in`

7) As zimbra user execute

   `zmskindeploy /tmp/zextras.zip`

8) As zimbra user execute

   `zmmailboxdctl restart`

## Contributions & Feedback

> **_NOTE:_**  This is a read-only mirror. This means that pull requests or issues wil not be managed here.

Want to contribute? Did you find a bug?

Have a look [here](https://support.zextras.com/hc/en-us) to file issues or suggestions.
