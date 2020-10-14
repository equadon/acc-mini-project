
# Different available API operations 

## Start

Starts the cluster with the specified number of servers (default *x*)

[TODO]: We might want some way to specify what data to analyze

Domain: /start   
Method: POST
Parameters: None  
Data:
 * optional: the number of servers to start with



## Status

Gives the status of the cluster in JSON. The following fields are available:

Domain: /status  
Method: GET  
Parameters: None  
Response (JSON):  
 * running (boolean): weather or not the server is running
 * servers (int): the number of servers currently running
 * [TODO]: Add more fields

## Resize

Increases, decreases or sets the number of servers to a specific amount

Domain: /resize  
Method: POST  
Parameters: None  
Data: an integer representing a specific number of servers to set to, a + followed by an integer representing a number of servers to add or a - followed by an integer representing a number of servers to remove.

## Inject

Injects data to be analysed

Domain: /inject  
Method: POST  
Parameters: None  
Data: a file of data to analyze
