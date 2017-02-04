
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
                    login(signedInUser);
                },
                fail: function() {
                    console.log('wrong password');
                }
            });
        });
});



/*
//get all the bills in database
$(function() {
    //var mlabUrl = "https://api.mlab.com/api/1/databases/billsdb/collections/billscollection?apiKey=VIJVGMOkT5Cc88A3_FjbAJ0jeEa1AJAo";
    var dbUrl = "http://localhost:8080/bills";
    $.get(dbUrl, function(data) {
        console.log(data);
    });
});

*/



function login(user) {
    var userId = user.user.id;
    var userFullName = user.user.fullName;
    console.log('hello, ', userFullName);
    $('header').toggleClass("hidden");
	var MOCK_DATA = {
            MOCK_USERS: [
                {
                    id: "username-userA",
                    fullName: "John Doe",
                    friendList: [
                        {id: "username-userB",
                         fullName: "Jane Doe",
                         balance: 29.30,
                         billHistory: [
                            {billId: "bill-id-A",
                            description: "Friday Dinner",
                            date: "October 13, 2016 11:13:00",
                            amount: 13.00
                            },
                            {billId: "bill-id-B",
                            description: "water bill",
                            date: "October 13, 2016 11:13:00",
                            amount: 16.30
                            }
                         ]
                        },
                        {id: "username-userC",
                         fullName: "Jack Doe",
                         balance: -29.30,
                         billHistory: [
                            {billId: "bill-id-C",
                            description: "Thursday night clubbing drink",
                            date: "October 13, 2016 11:13:00",
                            amount: -13.00
                            },
                            {billId: "bill-id-D",
                            description: "Uber",
                            date: "October 13, 2016 11:13:00",
                            amount: -16.30
                            }
                         ]
                        },
                        {id: "username-userD",
                         fullName: "Jay Doe",
                         balance: 0,
                         billHistory: []
                        }
                    ]
                }
            ]
    };

    function addNewBill(currentUser) {
        var inputBillTotal = 0;
        var currentBill = {
                totalAmount: inputBillTotal,
                billDate: 01-01-2017,
                description: '',
                billSplits: [
                    {splitterId: currentUser.id,
                     name: currentUser.fullName,
                     splitAmount: (inputBillTotal/2)
                    },
                    {splitterId: "username-userB",
                     name: "Jane Doe",
                     splitAmount: (inputBillTotal/2)
                    }
                ]
            };

        $('main').html('<p>Add a new bill</p>');
        $('main').append('<form class="js-billDetailsInput">' +
            'Date <input type="date" name="billDate"><br>' +
            'Description <input type="text" name="billDescription"><br>' +
            'Total Amount <input type="number" id="js-billTotalAmount" min="0"><br></form>'
        );
        $('main').append('<div><button class="js-equalSplit">Equal Split</button></div>' + '<div class="js-currentBillFriendList"></div>');
        renderCurrentBillSplitList();

        inputBillTotal = document.getElementById('js-billTotalAmount');
        function updateBillTotal() {
            var currentBillTotal = inputBillTotal.value;
            console.log(10, currentBillTotal);
            currentBill.totalAmount = currentBillTotal;
            
            renderCurrentBillSplitList();
        }
        inputBillTotal.onchange = updateBillTotal;
        
        console.log(21, currentUser.fullName);

        function equalSplit() {
            currentBill.billSplits.forEach(function(billSplitter) {
                billSplitter.splitAmount = currentBill.totalAmount / currentBill.billSplits.length;
            });
            renderCurrentBillSplitList();

        }

        function updateCurrentBill(updatedSplitAmount, updatedPersonUsername) {
            console.log(24);
            currentBill.billSplits.forEach(function(billSplit) {
                if (billSplit.splitterId === updatedPersonUsername) {
                    billSplit.splitAmount = updatedSplitAmount;
                }
            });
            renderCurrentBillSplitList();
        }


        function addFriendToBill(addFriendName, addSplitAmount) {
            var addedFriend = {
                splitterId: "id-" + addFriendName,
                name: addFriendName,
                splitAmount: addSplitAmount
            };
            currentBill.billSplits.push(addedFriend);
            renderCurrentBillSplitList();
        }

        function renderCurrentBillSplitList() {
            
            $('.js-currentBillFriendList').html('');
            currentBill.billSplits.forEach(function(billSplitter) {
                $('.js-currentBillFriendList').append(
                    '<div id="' + 
                    billSplitter.splitterId + 
                    '">' +
                    '<span>' + 
                    billSplitter.name + 
                    '  </span><span>  $<input type="number" class="js-billSplitterSplitAmount" value=' +
                    billSplitter.splitAmount + 
                    '></span><button class="js-updateCurrentSplit">Update</button></div>'
                );
            });
            $('.js-currentBillFriendList').append(
                '<input class="js-addFriendName" type="text" placeholder="Jack Doe">  $' +
                '<input class="js-addSplitAmount" type="number" placeholder="$12.00">' +
                '<button class="js-addaSplitter">Add</button><br>'
            );


            $('.js-currentBillFriendList').append('<button>Submit</button>');



            $('.js-updateCurrentSplit').click(function(event) {
                var updatedSplitAmount = $('.js-billSplitterSplitAmount').val();
                var updatedPersonUsername = $(this).closest('div').attr("id");
                console.log(25, updatedSplitAmount, updatedPersonUsername);
                updateCurrentBill(updatedSplitAmount, updatedPersonUsername);
            });
            console.log(18);
            $('.js-addaSplitter').click(function(event) {
            var addFriendName = $('.js-addFriendName').val();
            var addSplitAmount = $('.js-addSplitAmount').val();
            addFriendToBill(addFriendName, addSplitAmount);
        });
        }

        $('.js-equalSplit').click(function(event) {
            equalSplit();
        });        

    }


    function editBill(billId) {
        function renderEditBillForm(bill) {
            $('main').html('<form></form>');
            $('form').append(
                'Bill Date: <input class="billdate" type="date" value="' + bill.billDate + '"><br>' +
                'Description: <input class="billdescription" type="text" value="' + bill.description + '"><br>' +
                'Total Amount: <input class="billTotalAmount" type="number" value="' + bill.totalAmount + '"><br>');
            bill.users.forEach(function(user) {
                $('form').append('<input type="text" value="' + user.fullName + '"><input type="number" value="' + user.splitAmount + '"><br>');
            })
            $('form').append('Paid by:<input type="text" value="' + bill.paidByUser.fullName + '"><br>');
            $('form').append('Due: <input type="date" value="' + bill.dueDay + '"><br>');
            $('form').append('Memo: <input type="text" value="' + bill.memo + '"><br>' +
                '<button class="js-updateBillDetails">Submit</button>'
            );

            $('.js-updateBillDetails').click(function(event) {
                console.log("haha");
                bill.billDate = $('.billDate').val();
                bill.description = $('.billdescription').val();
                bill.totalAmount = $('.billTotalAmount').val();
                $.put({
                    url: 'http://localhost:8080/bills/' + billId,
                    data: bill,
                    success: function (data) {
                        console.log('success!');
                    }
                });
            });
        }        
        $.get({
            url: 'http://localhost:8080/bills/' + billId,
            success: function(data) {
                    renderEditBillForm(data);
            },
                fail: function() {
                    console.log('failed');
                }
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
                editBill(billId);
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
        $.get({
            url: 'http://localhost:8080/bills-user/' + userId + '/' + friendId,
            success: function(data) {
                    console.log(12, data);
                    displayTransactionHistories(data);
            },
                fail: function() {
                    console.log('wrong password');
                }
        });

        function displayTransactionHistories(data) {
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
                $('main').append('<p>' + friendName + 'owes you: $' + balance + '</p>');
            }
            if (balance < 0) {
                console.log('hello');
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
        $('main').append('<form>Username:<br>' +
            '<input type="text" name="username"><br>' +
            '<button>Submit</button>'
        );
    }


    /*
    function getBillSplitsSummary(callbackFn) {
        setTimeout(function(){ callbackFn(MOCK_DATA)}, 1);
    }
    */


    function displayBillSplitsSummary() {
        console.log(14, user);

        $('nav').html('<h4>Hello, ' + userFullName + '</h4>');
        $('main').html('<p>Your bill splits summary:</p>');
        var friendList = user.user.friends;
        console.log(12, friendList);
        friendList.forEach(function(friend) {
            console.log("friend: ", friend);
            $('main').append('<div userFriendId="' + friend._id + '" friendName="' + friend.fullname + '">' + friend.fullname + ':  $' + friend.balance + '   <button class="js-checkFriendBillLog">See Log</button></div>');
        });
        $('main').append('<button class="js-addNewFriend">Add a new user to your list</button></br>');
        $('main').append('<button class="js-addNewBill">Add a new bill</button>');
        $('.js-addNewFriend').click(function(event) {
            addNewFriend();
        });
        $('.js-addNewBill').click(function(event) {
            addNewBill(data.MOCK_USERS[0]);
        });

        $('.js-checkFriendBillLog').click(function(event) {
            var friendId = $(this).closest('div').attr('userFriendId');
            var friendName = $(this).closest('div').attr('friendName');
            //console.log(22, friendId, ' ', friendName);
            displayBillsWfriend(friendId, friendName);
        });
    }
    console.log(11, user);
    displayBillSplitsSummary(user);

    $('.js-goToMainPage').click(function(event) {
        displayBillSplitsSummary();    
    })

}

