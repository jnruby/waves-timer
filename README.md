# synced stopwatch
Basic program that uses a database for a stopwatch that multiple people can use at the same time if connected to that server.

The database is queried with javascript every 100ms but relies on the database's time in order for everyone to be on track 
*(or at least withint 100ms of one another (which is good enough for the original purpose of this))*

change the db credentials towards the top of the file timecheck.php for your specific system.

This can be successfully deployed as a server instance, for example AWS, or can be used on an intranet.

to get this to work on an intranet you will need a router and an ethernet cable. connect your computer to the router and find the ip address using ifconfig. You will need to install the LAMP stack. Place this project in a directory that you can access by localhost — /var/www/html/sync_stopwatch. tell other users to connect to that ip address and the folder that your stopwatch is in. 

so something like 
http://192.168.0.1/sync_stopwatch


### future:
+ multiple timers
+ show number of people connected
+ count down from specific time instead of up


migration:
 sudo mysql -uroot -ptimerbusinesstime < createtimertable.sql
