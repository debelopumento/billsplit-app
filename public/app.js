
function register(signedInUserFacebookId, signedInUserFullName) {
    $('main').html('<h3>New User Registration</h3>');
    var registrationForm = 'Username: <input class="js-userName" type="text" placeholder="username"><br>' +
    'Full Name:<input class="js-fullName" type="text" value="' + signedInUserFullName + '"><br>' +
    '<button class="js-submit">Submit</button>';
    $('main').append(registrationForm);
    $('.js-submit').click(function(event) {
        var newUser = {}
        newUser.facebookId = signedInUserFacebookId
        newUser.username = $('.js-userName').val();
        newUser.fullName = $('.js-fullName').val();
        newUser.friends = [];
        $.ajax({
            type: "POST",
            url: window.location.href + 'users/',
            data: JSON.stringify(newUser),
            dataType: "json",
            contentType: "application/json",
            success: function(data) {
                var signedInUser = {user: data};
                login(signedInUser);
            },
            error: function(e) {
                console.log(e);
            }
        });
    });
}

function login(signedInUser) {
    var userId = signedInUser.user.id;
    var userFullName = signedInUser.user.fullName;
    var signedInUserFriendList = signedInUser.user.friends;
    console.log(3939)
    $('header').removeClass("hidden");
    $('js-logout').click(function(event) {
        FB.logout(function(res) {
            conosle.log(49, res)
        })
    })
    function addNewBill() {
        var newBill = {
            totalAmount: 0,
            billDate: Date(),
            description: '',
            users: [
                {userId: userId,
                 fullName: userFullName,
                 splitAmount: 0
                },
                {userId: '',
                 fullName: '',
                 splitAmount: 0
                }
            ],
            //dueDay: Date(),
            postedTime: Date(),
            paidByUser: {userId: userId, fullName: userFullName},
            padiOff: false,
            memo: ""
        };
        var isNewBill = true;
        console.log(34, newBill)
        editBill(newBill, isNewBill);
    }



    function editBill(localBill, isNewBill) {
        var oldBill = localBill;
        var addablePeople = [];
        signedInUserFriendList.forEach(function(friend) {
            addablePeople.push(friend.fullName);
        });
        addablePeople.push(userFullName);
        function renderBillSplitterList() {
            var billSplitterListHtml = '';
            $('.js-billSplitterList').html('');
            var billSplitterCount = localBill.users.length;
            var billSplitIndex = 0;
            localBill.users.forEach(function(billSplitter) {
                billSplitterListHtml += '<div splitIndex="' + billSplitIndex + '"><input id="splitter-index-' + billSplitIndex + '" class="autocompleteName" type="text" value="' + billSplitter.fullName + '"><input id="splitAmount-index-' + billSplitIndex +'" type="number" value="' + billSplitter.splitAmount + '"><button class="js-removeBillSplitter">Remove</button></div>';
                billSplitIndex++;
            });
            $('.js-billSplitterList').append(billSplitterListHtml);
            $('.autocompleteName').autocomplete({
              source: addablePeople
            });
            $('.js-removeBillSplitter').click(function(event) {
                var splitIndex = $(this).closest('div').attr('splitIndex');
                localBill.users.splice(splitIndex, 1);
                renderBillSplitterList();
            });
        }

        function updateUserList() {
            var billSplitterCount = localBill.users.length;
            for (localIndex = 0; localIndex < billSplitterCount; localIndex++) {
                var splitterId = '#splitter-index-' + localIndex;
                localBill.users[localIndex].fullName = $(splitterId).val();
                signedInUserFriendList.forEach(function(friendSearch) {
                    if (friendSearch.fullName === localBill.users[localIndex].fullName) {
                        localBill.users[localIndex].userId = friendSearch.userId;
                    }
                });
                var splitAmountId = '#splitAmount-index-' + localIndex;
                localBill.users[localIndex].splitAmount = $(splitAmountId).val();
            }
        }

        console.log(35, localBill)
        $('main').html('<div class="js-editBillForm"></div>');        
        $('.js-editBillForm').append(
            '<div>Bill Date: <input class="billdate" type="date" value="' + formatDate(localBill.billDate) + '"></div>')
        $('.js-editBillForm').append(
            '<div>Description: <input class="js-billDescription" type="text" value="' + localBill.description + '"></div>' +
            '<div>Total Amount: <input class="billTotalAmount" type="number" value="' + localBill.totalAmount + '"></div>' +
            '<div><button class="js-equalSplit">Equal Split</button></div>' +
            '<div class="js-billSplitterList"></div>');
        console.log(36, localBill)
        renderBillSplitterList();

        $('.js-editBillForm').append(
            '<div><button class="js-addaSplitter">Add a friend to this bill</button></div>'
        );
        $('.js-editBillForm').append('<div>Paid by: <input id="paidByUser" class="autocompleteName" type="text" value="' + localBill.paidByUser.fullName + '"></div>');
        //$('.js-editBillForm').append('<div>Due: <input class="billDueDay" type="date" value="' + formatDate(localBill.dueDay) + '"></div>');
        $('.js-editBillForm').append('<div>Memo: <input class="billMemo memo" type="text" value="' + localBill.memo + '"></div>');
        $('.js-editBillForm').append('<div><button class="js-submitBillUpdates bigButton">Submit</button></div>');

        $('.js-addaSplitter').click(function(event) {
            updateUserList();
            var newUser = {
                userId: '',
                fullName: '',
                splitAmount: ''
            }
            console.log(20, newUser);
            localBill.users.push(newUser);
            
            renderBillSplitterList();
        });

        $('.js-equalSplit').click(function(event) {
            updateUserList();
            var billSplitterCount = localBill.users.length;
            localBill.totalAmount = $('.billTotalAmount').val();
            var equalSplitAmount = localBill.totalAmount / billSplitterCount;
            localBill.users.forEach(function(splitter) {
                splitter.splitAmount = equalSplitAmount;
            });
            renderBillSplitterList();

        });

        $('.js-submitBillUpdates').click(function(event) {

            var billSplitterCount = localBill.users.length;
            localBill.billDate = $('.billdate').val();
            console.log(37, localBill);
            localBill.description = $('.js-billDescription').val();
            localBill.totalAmount = $('.billTotalAmount').val();
            
            //validate split amounts
            var billIsValid = true
            var splitTotal = 0
            localBill.users.forEach(function(billSplitter) {
                splitTotal = splitTotal + billSplitter.splitAmount
            })

            console.log(56, splitTotal, 57, localBill.totalAmount)
            if (splitTotal != localBill.totalAmount) {
                alert('The total of splits does not equal to the total amount of the bill!')
                billIsValid = false
                console.log('something is wrong with the split amounts')
            }


            updateUserList();

            localBill.paidByUser.fullName = $('#paidByUser').val();
            
            signedInUserFriendList.forEach(function(friendSearch) {
                if (friendSearch.fullName === localBill.paidByUser.fullName) {
                    localBill.paidByUser.userId = friendSearch.userId;
                }
            });

            //localBill.dueDay = $('.billDueDay').val();
            localBill.memo = $('.billMemo').val();
            
            console.log(14, localBill);

            //if it's a new bill, POST, if it's an existing bill, PUT
            if (isNewBill === false && billIsValid === true) {
                $.ajax({
                    url: window.location.href + 'bills/' + localBill.id,
                    type: "PUT",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(localBill),
                    dataType: "json",
                    success: function (data) {
                        console.log(8, "bill is successfully sent to db");
                        getAndDisplayBillDetails(localBill.id);
                    },
                    error: function(e) {
                        console.log(e);
                    }
                });
            }
            if (isNewBill === true && billIsValid === true) {
                $.ajax({
                    url: window.location.href + 'bills/',
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(localBill),
                    dataType: "json",
                    success: function (data) {
                        console.log(8, "bill is successfully sent to db");
                        console.log(10, data);
                        getAndDisplayBillDetails(data._id);
                    },
                    error: function(e) {
                        console.log(e);
                    }
                });
            }
        });
    }

    function formatDate(unformattedDate) {
        var date = new Date(unformattedDate);
        var formattedMonth = date.getMonth() + 1;
        if (formattedMonth < 10) {
            formattedMonth = '0' + formattedMonth.toString();
        }
            else {formattedMonth = formattedMonth.toString();}
        var formattedDay = date.getDate() + 1;
        if (formattedDay < 10) {
            formattedDay = '0' + formattedDay.toString();
        }
            else {formattedDay = formattedDay.toString();}
        var formattedDate = date.getFullYear().toString() + '-' + formattedMonth + '-' + formattedDay;
        return formattedDate;
    }

    function displaySuccessfulDeleteScreen() {
        $('nav').html('<h4>Hello, ' + userFullName + '</h4>');
        $('main').html('<p>Your bill was deleted successfully!</p>');
    }

    function getAndDisplayBillDetails(billId) {
        function displayBill(bill) {
            $('main').html('<p>Bill Details:</p>');
            $('main').append('<p>Date: ' + formatDate(bill.billDate) + '</p>' +
            '<p>Description: ' + bill.description + '</p>' +
            '<p>Total Amount: ' + bill.totalAmount + '</p>') +
            '<p>Bill splits: </p>';
            bill.users.forEach(function(user) {
                if (user.userId === userId) {
                    $('main').append('<p>Your Split: $' + user.splitAmount + '</p>');
                }
                    else {
                        $('main').append('<p>' + user.fullName + ': $' + user.splitAmount + '</p>');
                    }
            });
            //who paid for the bill?
            if (bill.paidByUser.userId === userId) {
                $('main').append('<p>You paid for this bill.</p>');
            }
                else {
                    $('main').append('<p>' + bill.paidByUser.fullName + ' paid for this bill.</p>');
                }

            //$('main').append('<p>Due on: ' + formatDate(bill.dueDay) + '</p>');
            $('main').append('<p>Memo: ' + bill.memo + '</p>' +
                '<button class="js-editBill bigButton">Edit Bill</button>' +
                '<button class="js-deleteBill bigButton">Delete Bill</button>');
            $('.js-editBill').click(function(event) {
                var isNewBill = false;
                editBill(bill, isNewBill);
            });
            $('.js-deleteBill').click(function(event) {
                $.ajax({
                    url: window.location.href + 'bills/' + billId,
                    type: 'DELETE',
                    success: function() {
                        console.log('successfully deleted bill!');
                        displaySuccessfulDeleteScreen()
                    },
                    error: function(e) {
                        console.log(e);
                    }

                });
            });
        }
        $.get({
            url: window.location.href + 'bills/' + billId,
            success: function(data) {
                    displayBill(data);
            },
                fail: function() {
                    console.log('failed');
                }
        });
        
    }

    function displayBillsWfriend(friendId, friendName) {
        $.get({
            url: window.location.href + 'bills-sum-2users/' + userId + '/' + friendId,
            success: function(data) {
                    displayTransactionHistories(data, friendId);
            },
                fail: function() {
                    console.log('wrong password');
                }
        });

        function displayTransactionHistories(data, friendId) {
            $('main').html('<p>Your transactions with ' + friendName + ':</p>');
            var balance = 0;
            console.log(36, data)
            data.bills.forEach(function(localBill) {
                //If friend paid for the bill
                if (localBill.paidByUser.userId != userId) {                    
                    localBill.users.forEach(function(user) {
                        if (user.userId === userId) {
                            var userOwe = user.splitAmount;
                            $('main').append('<div class="transaction" billId="' + localBill.id + '"><container class="transactionDetails"><span class="date left">' + formatDate(localBill.billDate) + '   </span><span class="billdescription right">' + localBill.description + '   </span></container></br><container class="transactionLine bottom"><span class="billSplit">You owe: $' + userOwe + '</span><button class="js-checkBillDetails right">Edit/See Details</button><br></container></div>');
                            balance = balance - userOwe;
                        }
                    });
                }

                //If user paid for the bill, friend owes user money
                if (localBill.paidByUser.userId === userId) {
                    localBill.users.forEach(function(user) {
                        if (user.userId === friendId) {
                            var friendOwe = user.splitAmount;
                            $('main').append('<div class="transaction" billId="' + localBill.id + '"><container class="transactionDetails"><span class="date left">' + formatDate(localBill.billDate) + '   </span><span class="billdescription right">' + localBill.description + '   </span></container></br><container class="transactionLine bottom"><span class="billSplit">' + friendName  + ' owes you: $' + friendOwe + '</span><button class="js-checkBillDetails right">Edit/See Details</button><br></container></div>');
                            balance = balance + friendOwe;
                        }
                    });
                }
            });
            if (balance === 0) {
                $('main').append('<p>You two are even.</p>');
            }
            if (balance > 0) {
                $('main').append('<p>' + friendName + ' owes you: $' + balance + '</p>');
            }
            if (balance < 0) {
                $('main').append('<p>You owe ' + friendName + ' $' + (-balance) + '</p>');
            }
            //$('main').append('<p>The balance is: $' + balance + '.</p>');
            $('.js-checkBillDetails').click(function(event) {
                var curentBillId = $(this).closest('div').attr('billId');
                console.log(49, curentBillId)
                getAndDisplayBillDetails(curentBillId);
            });
        }   

    }

    function addNewFriend() {
        $('main').html('<p>Add this user:</p>');
        $('main').append('<input class="js-searchUsername" type="text" placeholder="username"><br>' +
            '<button class="js-submit">Add</button>'
        );
        $('.js-submit').click(function(event) {
            var searchUsername = $('.js-searchUsername').val();
            var url_username = window.location.href + 'users/username/' + searchUsername
            console.log(url_username);
            $.get({
                url: url_username,
                success: function(addedFriend) {
                        console.log(80, signedInUser);
                        //update user's friend list
                        signedInUser.friends.push({
                            userId: addedFriend.id,
                            fullName: addedFriend.fullName,
                            balance: 0
                        });
                        $.ajax({
                            url: window.location.href + 'users/userUpdate/' + signedInUser.id,
                            type: "PUT",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(signedInUser),
                            dataType: "json",
                            success: function () {
                                console.log("added ", addedFriend.fullName, " successfully!");
                                addedFriend.friends.push({
                                    userId: signedInUser.id,
                                    fullName: userFullName,
                                    balance: 0
                                });
                                $.ajax({
                                    url: window.location.href + 'users/userUpdate/' + addedFriend.id,
                                    type: "PUT",
                                    contentType: "application/json; charset=utf-8",
                                    data: JSON.stringify(addedFriend),
                                    dataType: "json",
                                    success: function () {
                                        console.log("added ", addedFriend.fullName, " successfully!");
                                        displayBillSplitsSummary();
                                    },
                                    error: function(e) {
                                        console.log(e);
                                    }
                                });
                            },
                            error: function(e) {
                                console.log(e);
                            }
                        });                        
                        
                    },
                    fail: function() {
                        console.log('failed');
                    }
            });
        });
    }


    function displayBillSplitsSummary() {
        $.ajax({
            url: window.location.href + 'users/userId/' + userId,
            type: 'GET',
            success: function(data) {
                console.log(71, data);
                signedInUser = data;
                signedInUserFriendList = data.friends;
                $('nav').html('<h4>Hello, ' + userFullName + '</h4>');
                $('main').html('<h3>Your bill splits summary:</h3>');
                signedInUserFriendList.forEach(function(friend) {
                    if (friend.balance < 0) {
                        $('main').append('<div userFriendId="' + friend.userId + '" friendName="' + friend.fullName + '">' + friend.fullName + ' owes you:  $' + (-friend.balance) + '   <button class="js-checkFriendBillLog right">See Log</button></div>');
                    } 
                        else if (friend.balance === 0) {
                            $('main').append('<div userFriendId="' + friend.userId + '" friendName="' + friend.fullName + '">' + friend.fullName + ':  $' + friend.balance + '   <button class="js-checkFriendBillLog right">See Log</button></div>');
                        }
                            else {
                                $('main').append('<div userFriendId="' + friend.userId + '" friendName="' + friend.fullName + '">' + friend.fullName + ' lends deposit you:  $' + friend.balance + '   <button class="js-checkFriendBillLog right">See Log</button></div>');
                            }
                });
                $('main').append('<div class="buttonContainer"><button class="js-addNewFriend bigButton">Add a new user to your friend list</button></br><button class="js-addNewBill bigButton">Add a new bill</button></div>');
                $('.js-addNewFriend').click(function(event) {
                    addNewFriend();
                });
                $('.js-addNewBill').click(function(event) {
                    addNewBill();
                });
                $('.js-checkFriendBillLog').click(function(event) {
                    var friendId = $(this).closest('div').attr('userFriendId');
                    var friendName = $(this).closest('div').attr('friendName');
                    displayBillsWfriend(friendId, friendName);
                });
            },
            error: function(e) {
                console.log(e);
            }
        });
    }

    displayBillSplitsSummary();
    $('.js-goToMainPage').click(function(event) {
        displayBillSplitsSummary();    
    });
    $('.js-logout').click(function(event) {
        FB.logout()
        window.location.reload()
    })

}


$(function() {
        $(function() {
            // This is called with the results from from FB.getLoginStatus().
                
          window.fbAsyncInit = function() {
              FB.init({
                appId      : '1859697977624978',
                cookie     : true,  // enable cookies to allow the server to access 
                                    // the session
                xfbml      : true,  // parse social plugins on this page
                version    : 'v2.8' // use graph api version 2.8
              });

              // Now that we've initialized the JavaScript SDK, we call 
              // FB.getLoginStatus().  This function gets the state of the
              // person visiting this page and can return one of three states to
              // the callback you provide.  They can be:
              //
              // 1. Logged into your app ('connected')
              // 2. Logged into Facebook, but not your app ('not_authorized')
              // 3. Not logged into Facebook and can't tell if they are logged into
              //    your app or not.
              //
              // These three cases are handled in the callback function.

              FB.getLoginStatus(function(response) {
                //statusChangeCallback(response);
                if(response.status === 'connected') {
                  var signedInUserFacebookId = ''
                  FB.api('/me', function(response) {
                      signedInUserFacebookId = response.id
                      $.ajax({
                        url: window.location.href + 'users/facebookId/' + signedInUserFacebookId,
                        type: 'GET',
                        success: function(data) {
                            console.log(1, data);
                            if (data != 0) {
                                var signedInUser = {user: data}
                                login(signedInUser)
                            }
                            if (data === 0) {
                                signedInUserFullName = response.name
                                console.log(2, signedInUserFullName)
                                register(signedInUserFacebookId, signedInUserFullName)
                            }
                        }
                      })
                  });
                  
                }
              });

          };

          // Load the SDK asynchronously
          (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));

  
        })
        $('header').toggleClass("hidden");
        var row = '';
        row += '<fb:login-button autologoutlink="false" id="fbloginbutton" scope="public_profile,email" onlogin="checkLoginState();"></fb:login-button>'
        row += '<p>Demo Account:</p>'
        row += '<p>jasmin_wsdciiq_doe@tfbnw.net</p>'
        row += '<p>password: demoPassword</p>'
        $('main').html(row);
             
});

