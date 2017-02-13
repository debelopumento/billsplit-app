
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

function login(signedInUser) {
    var userId = signedInUser.user.id;
    var userFullName = signedInUser.user.fullName;
    var signedInUserFriendList = signedInUser.user.friends;
    $('header').toggleClass("hidden");

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
                postedTime: Date(),
                paidByUser: {userId: userId, fullName: userFullName},
                padiOff: false,
                memo: ""
        };
        var isNewBill = true;
        editBill(newBill, isNewBill);
    }



    function editBill(localBill, isNewBill) {
        var oldBill = localBill;
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

        var addablePeople = [];
        signedInUserFriendList.forEach(function(friend) {
            addablePeople.push(friend.fullName);
        });
        addablePeople.push(userFullName);

        $('main').html('<div class="js-editBillForm"></div>');        
        $('.js-editBillForm').append(
            '<div>Bill Date: <input class="billdate" type="date" value="' + formatDate(localBill.billDate) + '"></div>' +
            '<div>Description: <input class="billdescription" type="text" value="' + localBill.description + '"></div>' +
            '<div>Total Amount: <input class="billTotalAmount" type="number" value="' + localBill.totalAmount + '"></div>' +
            '<div><button class="js-equalSplit">Equal Split</button></div>' +
            '<div class="js-billSplitterList"></div>');

        renderBillSplitterList();

        $('.js-editBillForm').append(
            '<div><button class="js-addaSplitter">Add a friend to this bill</button></div>'
        );
        $('.js-editBillForm').append('<div>Paid by:<input id="paidByUser" class="autocompleteName" type="text" value="' + localBill.paidByUser.fullName + '"></div>');
        $('.js-editBillForm').append('<div>Due: <input class="billDueDay" type="date" value="' + formatDate(localBill.dueDay) + '"></div>');
        $('.js-editBillForm').append('<div>Memo: <input class="billMemo" type="text" value="' + localBill.memo + '"></div>');
        $('.js-editBillForm').append('<div><button class="js-submitBillUpdates">Submit</button></div>');

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
            localBill.billDate = $('.billDate').val();
            localBill.description = $('.billdescription').val();
            localBill.totalAmount = $('.billTotalAmount').val();
            
            updateUserList();

            localBill.paidByUser.fullName = $('#paidByUser').val();
            /*
            signedInUserFriendList.push({
                fullName: userFullName,
                userId: userId
            });
            */
            signedInUserFriendList.forEach(function(friendSearch) {
                if (friendSearch.fullName === localBill.paidByUser.fullName) {
                    localBill.paidByUser.userId = friendSearch.userId;
                }
            });

            localBill.dueDay = $('.billDueDay').val();
            localBill.memo = $('.billMemo').val();
            
            console.log(14, localBill);

            //if it's a new bill, POST, if it's an existing bill, PUT
            if (isNewBill === false) {
                $.ajax({
                    url: window.location.href + 'bills/' + localBill.id,
                    type: "PUT",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(localBill),
                    dataType: "json",
                    success: function (data) {
                        console.log(8, "bill is successfully sent to db");
                        displayBillSplitsSummary();
                        
                    },
                    error: function(e) {
                        console.log(e);
                    }
                });
            }
            if (isNewBill === true) {
                $.ajax({
                    url: "http://localhost:8080/bills/",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(localBill),
                    dataType: "json",
                    success: function (data) {
                        console.log(8, "bill is successfully sent to db");
                        //updateBalances(localBill, isNewBill, oldBill);
                        displayBillSplitsSummary();
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

            $('main').append('<p>Due on: ' + formatDate(bill.dueDay) + '</p>');
            $('main').append('<p>Memo: ' + bill.memo + '</p>' +
                '<button class="js-editBill">Edit this bill</button>' +
                '<button class="js-deleteBill">Delete this bill</button>');
            $('.js-editBill').click(function(event) {
                var isNewBill = false;
                editBill(bill, isNewBill);
            });
            $('.js-deleteBill').click(function(event) {
                $.ajax({
                    url: 'http://localhost:8080/bills/' + billId,
                    type: 'DELETE',
                    success: function() {
                        console.log('successfully deleted bill!');
                        displayBillSplitsSummary();
                    },
                    error: function(e) {
                        console.log(e);
                    }

                });
            });
        }
        $.get({
            url: 'http://localhost:8080/bills/' + billId,
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
            url: 'http://localhost:8080/bills-sum-2users/' + userId + '/' + friendId,
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
            data.bills.forEach(function(localBill) {
                //If friend paid for the bill
                if (localBill.paidByUser.userId != userId) {                    
                    localBill.users.forEach(function(user) {
                        if (user.userId === userId) {
                            var userOwe = user.splitAmount;
                            $('main').append('<div billId="' + localBill.id + '"><span>' + formatDate(localBill.billDate) + '   </span><span>' + localBill.description + '   </span><span>You owe: $' + userOwe + '</span><button class="js-checkBillDetails">Edit/See Details</button><br>');
                            balance = balance - userOwe;
                        }
                    });
                }

                //If user paid for the bill, friend owes user money
                if (localBill.paidByUser.userId === userId) {
                    console.log(12, localBill.paidByUser);
                    localBill.users.forEach(function(user) {
                        if (user.userId === friendId) {
                            var friendOwe = user.splitAmount;
                            $('main').append('<div billId="' + localBill.id + '"><span>' + formatDate(localBill.billDate) + '   </span><span>' + localBill.description + '   </span>' + friendName  + '<span> owes you: $' + friendOwe + '</span><button class="js-checkBillDetails">Edit/See Details</button><br>');
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
                        //console.log(80, signedInUser);
                        //update user's friend list
                        currentUser = signedInUser.user;
                        console.log(81, currentUser);
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
            $('main').append('<div userFriendId="' + friend.userId + '" friendName="' + friend.fullName + '">' + friend.fullName + ':  $' + friend.balance + '   <button class="js-checkFriendBillLog">See Log</button></div>');
        });
        $('main').append('<button class="js-addNewFriend">Add a new user to your friend list</button></br>');
        $('main').append('<button class="js-addNewBill">Add a new bill</button>');
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
    }

    displayBillSplitsSummary();

    $('.js-goToMainPage').click(function(event) {
        displayBillSplitsSummary();    
    });

}


$(function() {
        $('header').toggleClass("hidden");
        var row = '';
        row += '<p>Hello!</p><br>';
        row += '<input class="username" type="text" value="username-userD"><br>';
        row += '<input class="password" type="password" value="password-userD">';
        row += '<button class="js-login">Login</button>';
        row += '<p>New User?</p>';
        row += '<button class="js-register">Register</button>';
        $('main').html(row);
        $('.js-login').click(function() {
            var usernameInput = $('.username').val();
            var passwordInput = $('.password').val();
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

