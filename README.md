# Buying real estate for the brokers.

This is a full stack project which gives a platform for the brokers to sell and buy and favoritize any properties.

## How to use the application

First you need to register your username, email and password. After registration you can login with your email and password. After logged in successfully you will be see on the left side a form to add your property and on the right side you will see the list of properties added by you and other brokers. From the left hand side form you will need to fill in type of property, location, area, nearest landmark and price of your property and add property button which you will use to add the property. After adding the property in the right side you will see the list of properties where you can add properties to your favorite list and edit and delete only the property that you have created. And you can also logout from the application to the login page using the logout button.

## How does the application work

On the backend we have used node.js with express, on the frontend we have angular and on the database we have used mongodb. We use sessions based authetication backed by database meaning we store sessionids which has a TTL of 7 days are stored in the database and we auto delete the older sessionsids more than 7 days. We also handle race conditions while registering the users. 

In the property section we have role based usage. The super admin can edit, delete all the properties and the broker role can edit and delete the properties that they have created. We have implemented a pagination feature to prevent the overload in the database for the property's list.

The favorite works by add the favorite property that the user has selected to the Favorite collection in the database and if a user unselects the property then we mark it as a soft delete such that in future if the same user again selects the same proerpty as favorite the overhead is less.

Additionally, by doing a scan through semgrep we found out a cross site request forgery web security vunerability which is handled by only allowing GET, HEAD, OPTIONS from other sites than our forntend site and PUT, DELETE, POST and other requests are blocked.

## Future enhancements

We need to implement idempotency key to make our application more robust. We can use this concept on the POST, PUT and DELETE endpoints such that we can prevent same data being saved twice for some reasons.

Feature wise we can implement searching and sorting the properties list. We can add support for the image of the property.