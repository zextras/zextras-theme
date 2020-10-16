Zextras Transitional Theme
========================

Here are the instructions to deploy the theme:

1) Copy the content of this repo in a folder named exactly "zextras"

2) Copy the folder "zextras" to "/opt/zimbra/jetty/webapps/zimbra/skins/"

3) Fix the folder permissions with "/opt/zimbra/libexec/zmfixperms -v"

4) Finally restart the Mailbox with "zmmailboxdctl restart" (or 'su - zimbra -c "zmmailboxdctl restart"')
