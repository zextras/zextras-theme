Zextras Theme
========================

Here are the instructions to deploy the theme:

1) Copy the content of this repo in a folder named exactly "zextras"

2) Copy the folder "zextras" to "/opt/zimbra/jetty/webapps/zimbra/skins/"

3) Fix the folder permissions with "chown zimbra:zimbra -R /opt/zimbra/jetty/webapps/zimbra/skins/zextras"

4) Add the skin with "zmprov mcf +zimbraInstalledSkin zextras" (??zmskindeploy /opt/zimbra/jetty/webapps/zimbra/skins/zextras??)

5) [optional] Edit /opt/zimbra/jetty/etc/zimbra.web.xml.in on zimbraDefaultSkin param to set as default skin for anonimous users

...and Finally restart the Mailbox with "zmmailboxdctl restart" (or 'su - zimbra -c "zmmailboxdctl restart"')
