Zextras Theme
========================

Here are the instructions to deploy the theme:

1) Download the zip file from this page

2) Extract the contenent and modify the folder name with the new name "zextras"

3) zip the folder with the comand "zip -r zextras.zip zextras"

4) copy the zip file in /tmp/ and change the permission with zimbra.zimbra

5) modify the zimbra binary with this syntax "sed -i '/+ZimbraInstalledSkin/d' /opt/zimbra/bin/zmskindeploy"

6) modify jetty configuration with the new theme "sed -i 's/harmony/zextras/g' /opt/zimbra/jetty/etc/zimbra.web.xml.in"

5) As zimbra "zmskindeploy /tmp/zextras.zip"

6) As zimbra "zmmailboxdctl restart"
