
function register() {
    $('main').html('<h3>New User Registration</h3>');
    var registrationForm = '<input class="js-userName" type="text" placeholder="username"><br>' +
    '<input class="js-password" type="password" placeholder="p@ssW0rd"><br>' +
    '<input class="js-fullName" type="text" placeholder="Full Name"><br>' +
    '<button class="js-submit">Submit</button>';
    $('main').append(registrationForm);
    $('.js-submit').click(function(event) {
        var newUser = {};
        newUser.username = $('.js-userName').val();
        newUser.password = $('.js-password').val();
        newUser.fullName = $('.js-fullName').val();
        newUser.friends = [];
        $.ajax({
                    type: "POST",
                    url: "http://localhost:8080/users/",
                    data: JSON.stringify(newUser),
                    dataType: "json",
                    contentType: "application/json",
                    success: function(data) {
                        console.log(1, data);
                        console.log(2, data.id);
                        var signedInUser = {user: data};
                        login(signedInUser);
                    },
                    error: function(e) {
                        console.log(e);
                    }
                });
    });
}

function login(user) {
    var userId = user.user.id;
    var userFullName = user.user.fullName;
    var signedInUserFriendList = user.user.friends;
    $('header').toggleClass("hidden");

    function addNewBill() {
        var inputBillTotal = 0;
        var currentBill = {
                totalAmount: inputBillTotal,
                billDate: Date(),
                description: '',
                users: [
                    {userId: userId,
                     fullName: userFullName,
                     splitAmount: 0
                    }
                ],
                postedTime: Date(),
                paidByUser: {userId: "", fullName: ""},
                padiOff: false,
                memo: ""
            };
        $('main').html('<p>Add a new bill</p>');
        $('main').append('<div>' +
            //'Date <input type="date" name="billDate" value="' + currentBill.billDate + '"><br>' +
            'Description <input type="text" class="js-billDescription"><br>' +
            'Bill paid by: <input type="text" class="js-billPaidByUser"><br>' +
            'Total Amount <input type="number" class="js-billTotalAmount" min="0"><br></div>'
        );
        $('main').append('<div><button class="js-equalSplit">Equal Split</button></div>' + 
            '<div class="js-currentBillFriendList"></div>');
        renderCurrentBillSplitList();
    
        function equalSplit() {
            currentBill.users.forEach(function(billSplitter) {
                billSplitter.splitAmount = currentBill.totalAmount / currentBill.users.length;
            });
            renderCurrentBillSplitList();
        }
        function renderCurrentBillSplitList() {
            var billSplitterIndex = 0;
            
            $('.js-currentBillFriendList').append(
                '<div><span><input class="billSplitterId-index-0" type="string" value="' + 
                currentBill.users[0].userId + 
                '"></span><span>  $<input type="number" class="billSplitAmount-index-0" placeholder="10.00"></span></div>'
            );
            
            $('main').append(
                
                '<button class="js-addaSplitter">Add a friend to this bill</button><br>'
            );


            $('main').append('<button class="js-sumbitNewBill">Submit</button>');

            /*
            $('.js-updateCurrentSplit').click(function(event) {
                var updatedSplitAmount = $('.js-billSplitterSplitAmount').val();
                var updatedPersonUsername = $(this).closest('div').attr("id");
                console.log(25, updatedSplitAmount, updatedPersonUsername);
                updateCurrentBill(updatedSplitAmount, updatedPersonUsername);
            });
            */

            var billSplitterIndex = 1;

            $('.js-addaSplitter').click(function(event) {
                $('.js-currentBillFriendList').append(
                    '<div><span><input class="billSplitterId-index-' + billSplitterIndex + '" type="text" placeholder="Jack Doe"></span>' +
                    '<span> $<input class="billSplitAmount-index-' + billSplitterIndex + '" type="number" placeholder="12.00"></span></div>'
                );
                currentBill.users.push({userId: "", fullName: "", splitAmount: 0});
                billSplitterIndex ++;
            });
        }

        $('.js-equalSplit').click(function(event) {
            equalSplit();
        });  

        $('.js-sumbitNewBill').click(function(event) {
                currentBill.description = $('.js-billDescription').val();
                currentBill.totalAmount = $('.js-billTotalAmount').val();
                currentBill.paidByUser.userId = $('.js-billPaidByUser').val();
                //get bill split info
                var index = 0;
                currentBill.users.forEach(function(splitter) {
                    var idKey = '.billSplitterId-index-' + index;
                    var spliAmountKey = '.billSplitAmount-index-' + index;
                    splitter.userId = $(idKey).val();
                    splitter.splitAmount = $(spliAmountKey).val();
                    index = index + 1;
                });
                console.log(100, currentBill);

                $.ajax({
                    type: "POST",
                    url: "http://localhost:8080/bills/",
                    data: JSON.stringify(currentBill),
                    dataType: "json",
                    contentType: "application/json",
                    success: function(data) {
                        console.log(800, data);
                        
                        //Updated all users<->paidUser's balance in database
                        updateBalances(currentBill);
                        //

                        
                    },
                    error: function(e) {
                        console.log(e);
                    }
                });
        });    

    }

    function updateBalances(localBill) {
        localBill.users.forEach(function(localUser) {
            if(localUser.userId != localBill.paidByUser.userId) {
                $.get({
                    url: 'http://localhost:8080/bills-sum-2users/' + localUser.userId + '/' + localBill.paidByUser.userId,
                    success: function(data) {
                            console.log(12, data);
                    },
                        fail: function() {
                            console.log('wrong password');
                        }
                });
            }
            displayBillSplitsSummary();
        });
    }

    function editBill(bill) {
        var addablePeople = [];
        signedInUserFriendList.forEach(function(friend) {
            addablePeople.push(friend.fullName);
        });
        addablePeople.push(userFullName);

        $('main').html('<div></div>');        
        $('div').append(
            'Bill Date: <input class="billdate" type="date" value="' + bill.billDate + '"><br>' +
            'Description: <input class="billdescription" type="text" value="' + bill.description + '"><br>' +
            'Total Amount: <input class="billTotalAmount" type="number" value="' + bill.totalAmount + '"><br>');
        
        bill.users.forEach(function(billSplitter) {
            $('div').append('<input class="autocompleteName" type="text" value="' + billSplitter.fullName + '"><input type="number" value="' + billSplitter.splitAmount + '"><br>');
        })        

        $('div').append('Paid by:<input class="autocompleteName" type="text" value="' + bill.paidByUser.fullName + '"><br>');
        $('div').append('Due: <input type="date" value="' + bill.dueDay + '"><br>');
        $('div').append('Memo: <input type="text" value="' + bill.memo + '"><br>');
        $('div').append('<button class="js-submitBillUpdates">Update</button>');

        console.log(29, bill);
        console.log(71, addablePeople);
        $( ".autocompleteName" ).autocomplete({
          source: addablePeople
        });

        $('.js-submitBillUpdates').click(function(event) {                
            bill.billDate = $('.billDate').val();
            bill.description = $('.billdescription').val();
            bill.totalAmount = $('.billTotalAmount').val();

            console.log(30, bill);
            $.ajax({
                url: "http://localhost:8080/bills/" + bill.id,
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(bill),
                dataType: "json",
                success: function (data) {
                    console.log(78, data);
                    updateBalances(bill);
                },
                error: function(e) {
                    console.log(e);
                }
            });
        }); 
        
    }

    function getAndDisplayBillDetails(billId) {
        function displayBill(bill) {
            $('main').html('<p>Bill Details:</p>');
            $('main').append('<p>Date: ' + bill.billDate + '</p>' +
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

            $('main').append('<p>Due on: ' + bill.dueDay + '</p>');
            $('main').append('<p>Memo: ' + bill.memo + '</p>' +
                '<button class="js-editBill">Edit this bill</button>');
            $('.js-editBill').click(function(event) {
                editBill(bill);
            });
        }
        $.get({
            url: 'http://localhost:8080/bills/' + billId,
            success: function(data) {
                    console.log(123, data);
                    displayBill(data);
            },
                fail: function() {
                    console.log('failed');
                }
        });
        
    }

    function displayBillsWfriend(friendId, friendName) {
        console.log(1, userId, 2, friendId);
        $.get({
            url: 'http://localhost:8080/bills-sum-2users/' + userId + '/' + friendId,
            success: function(data) {
                    console.log(12, data);
                    displayTransactionHistories(data, friendId);
            },
                fail: function() {
                    console.log('wrong password');
                }
        });

        function displayTransactionHistories(data, friendId) {
            $('main').html('<p>Your transactions with ' + friendName + ':</p>');
            console.log(150, data);
            var balance = 0;
            data.bills.forEach(function(bill) {
                //If friend paid for the bill
                if (bill.paidByUser.userId != userId) {
                    bill.users.forEach(function(user) {
                        if (user.userId === userId) {
                            var userOwe = user.splitAmount;
                            console.log(89, bill);
                            $('main').append('<div billId="' + bill.id + '"><span>' + bill.billDate + '   </span><span>' + bill.description + '   </span><span>You owe: $' + userOwe + '</span><button class="js-checkBillDetails">Edit/See Details</button><br>');
                            balance = balance - userOwe;
                        }
                });}

                //If user paid for the bill, friend owes user money
                if (bill.paidByUser.userId === userId) {
                    bill.users.forEach(function(user) {
                        if (user.userId === friendId) {
                            var friendOwe = user.splitAmount;
                            $('main').append('<div billId="' + bill.id + '"><span>' + bill.billDate + '   </span><span>' + bill.description + '   </span>' + friendName  + '<span> owes you: $' + friendOwe + '</span><button class="js-checkBillDetails">Edit/See Details</button><br>');
                            balance = balance + friendOwe;
                        }
                    });
                }
            });
            console.log(232, balance);

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
                var cuurentBillId = $(this).closest('div').attr('billId');
                getAndDisplayBillDetails(cuurentBillId);
            });
        }   

    }

    function addNewFriend() {
        $('main').html('<p>Add this user:</p>');
        $('main').append('<p>Username:</p>' +
            '<input class="js-searchUsername" type="text" value="username-userO"><br>' +
            '<button class="js-submit">Add</button>'
        );
        $('.js-submit').click(function(event) {
            var searchUsername = $('.js-searchUsername').val();
            var url_username = 'http://localhost:8080/users/username/' + searchUsername;
            
            $.get({
                url: url_username,
                success: function(addedFriend) {
                        console.log(80, addedFriend);
                        //update user's friend list
                        currentUser = user.user;
                        currentUser.friends.push({
                            userId: addedFriend.id,
                            fullName: addedFriend.fullName,
                            balance: 0
                        });
                        console.log(70, currentUser);
                        $.ajax({
                            url: "http://localhost:8080/users/userUpdate/" + currentUser.id,
                            type: "PUT",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(currentUser),
                            dataType: "json",
                            success: function () {
                                console.log("added ", addedFriend.fullName, " successfully!");
                            },
                            error: function(e) {
                                console.log(e);
                            }
                        });
                        //add user to friend's friend list.
                        addedFriend.friends.push({
                            userId: currentUser.id,
                            fullName: userFullName,
                            balance: 0
                        });
                        $.ajax({
                            url: "http://localhost:8080/users/userUpdate/" + addedFriend.id,
                            type: "PUT",
                            contentType: "application/json; charset=utf-8",
                            data: JSON.stringify(addedFriend),
                            dataType: "json",
                            success: function () {
                                console.log("added ", addedFriend.fullName, " successfully!");
                            },
                            error: function(e) {
                                console.log(e);
                            }
                        });
                        displayBillSplitsSummary();
                    },
                    fail: function() {
                        console.log('failed');
                    }
            });
        });
    }


    function displayBillSplitsSummary() {
        $('nav').html('<h4>Hello, ' + userFullName + '</h4>');
        $('main').html('<p>Your bill splits summary:</p>');
        signedInUserFriendList.forEach(function(friend) {
            console.log("friend: ", friend);
            $('main').append('<div userFriendId="' + friend.userId + '" friendName="' + friend.fullName + '">' + friend.fullName + ':  $' + friend.balance + '   <button class="js-checkFriendBillLog">See Log</button></div>');
        });
        $('main').append('<button class="js-addNewFriend">Add a new user to your friend list</button></br>');
        $('main').append('<button class="js-addNewBill">Add a new bill</button>');
        $('.js-addNewFriend').click(function(event) {
            addNewFriend();
        });
        $('.js-addNewBill').click(function(event) {
            console.log(44);
            addNewBill();
        });

        $('.js-checkFriendBillLog').click(function(event) {
            var friendId = $(this).closest('div').attr('userFriendId');
            var friendName = $(this).closest('div').attr('friendName');
            console.log(34, user.user.id);
            displayBillsWfriend(friendId, friendName);
        });
    }
    displayBillSplitsSummary(user);
    $('.js-goToMainPage').click(function(event) {
        displayBillSplitsSummary();    
    })

}


$(function() {
        $('header').toggleClass("hidden");
        var row = '';
        row += '<p>Hello!</p><br>';
        row += '<input class="username" type="text" value="username-userA"><br>';
        row += '<input class="password" type="password" value="password-userA">';
        row += '<button class="js-login">Login</button>';
        row += '<p>New User?</p>';
        row += '<button class="js-register">Register</button>';
        $('main').html(row);
        $('.js-login').click(function() {
            var usernameInput = $('.username').val();
            var passwordInput = $('.password').val();
            console.log(5, usernameInput, passwordInput);
            var loginURL = "http://localhost:8080/users/me";
            $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                headers: {
                    'Authorization': 'Basic ' + btoa(usernameInput + ':' + passwordInput)
                },
                url: loginURL,
                success: function(signedInUser) {
                    console.log(signedInUser);
                    login(signedInUser);
                },
                fail: function() {
                    console.log('wrong password');
                }
            });
        });
        $('.js-register').click(function(event) {
            register();
        });






});

