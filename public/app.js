
$(function() {
    function authenticate() {
        console.log(4);

    }

    function initialize() {
        $('header').toggleClass("hidden");
        var row = '';
        row += '<p>Hello!</p><br>';
        row += '<input class="username" type="text" placeholder="username"><br>';
        row += '<input class="password" type="password" placeholder="passW0rd">';
        row += '<button class="js-login">Login</button>';
        row += '<p>New User?</p>';
        row += '<button class="js-register">Register</button>';
        $('main').html(row);
        console.log(7);
        $('.js-login').click(function() {
            console.log(6);
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
                success: function(data) {
                    console.log(data);
                },
                fail: function() {
                    console.log('wrong password');
                }
            });

        });
    }

    initialize();
    //authenticate();


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


/*
$(function login() {
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


    function editBill() {
        var bill = {
            id: "bill-id-A",
            date: Date(),
            description: "Rent",
            totalAmount: 2500,
            splitAmount: 1250,
            memo: "pay by: 12-15-2016"
        };
        $('main').html('<form></form>');
        $('form').append(
            'Date: <input type="date" value="' + bill.date + '"><br>' +
            'Description: <input type="text" value="' + bill.description + '"><br>' +
            'Total Amount: <input type="number" value="' + bill.totalAmount + '"><br>' +
            'Your Split: <input type="number" value="' + bill.splitAmount + '"><br>' +
            'Memo: <input type="text" value="' + bill.memo + '"><br>' +
            '<button class="js-updateBillDetails">Submit</button>'
        );
        $('.js-updateBillDetails').click(function(event) {
            displayBillDetails();
        });
    }

    function displayBillDetails() {
        var bill = {
            id: "bill-id-A",
            date: "12-01-2016",
            description: "Rent",
            totalAmount: 2500,
            splitAmount: 1250,
            memo: "pay by: 12-15-2016"
        };
        $('main').html('<p>Bill Details:</p>');
        $('main').append('<p>Date: ' + bill.date + '</p>' +
            '<p>Description: ' + bill.description + '</p>' +
            '<p>Total Amount: ' + bill.totalAmount + '</p>' +
            '<p>Your Split: ' + bill.splitAmount + '</p>' +
            '<p>Memo: ' + bill.memo + '</p>' +
            '<button class="js-editBill">Edit this bill</button>'
        );
        $('.js-editBill').click(function(event) {
            editBill();
        });
    }

    function displayBillsWfriend(userFriendId) {
        var mockBillsWfriend = [
            {
                date: "12-01-2016",
                description: "rent",
                amount: -1250
            },
            {
                date: "12-05-2016",
                description: "Water Bill",
                amount: -45
            },
            {
                date: "12-13-2016",
                description: "Movie Ticket",
                amount: 17.5
            }
        ];
        
        var balance = 0;

        $('main').html('<p>Your transactions with ' + userFriendId + ':</p>');
        mockBillsWfriend.forEach(function(bill) {
            $('main').append(
                '<div><span>' + bill.date + '   </span><span>' + bill.description + '   </span><span>$' + bill.amount + '</span><button class="js-checkBillDetails">Edit/See Details</button><br>'
            );
            balance = balance + bill.amount;
        });
        $('main').append('<p>The balance is: $' + balance + '.</p>');
        $('.js-checkBillDetails').click(function(event) {
            displayBillDetails();
        });
    }

    function addNewFriend() {
        $('main').html('<p>Add this user:</p>');
        $('main').append('<form>Username:<br>' +
            '<input type="text" name="username"><br>' +
            '<button>Submit</button>'
        );
    }

    function getBillSplitsSummary(callbackFn) {
        setTimeout(function(){ callbackFn(MOCK_DATA)}, 1);
    }


    function displayBillSplitsSummary(data) {
        $('nav').html('<h4>Hello, ' + data.MOCK_USERS[0].fullName + '</h4>');
        $('main').html('<p>Your bill splits summary:</p>');
        var currentUserFriendList = data.MOCK_USERS[0].friendList;
        currentUserFriendList.forEach(function(usersFriend) {
            $('main').append('<div userFriendId="' + usersFriend.id + '">' + usersFriend.fullName + ':  $' + usersFriend.balance + '   <button class="js-checkFriendBillLog">See Log</button></div>');
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
            var userFriendId = $(this).closest('div').attr('userFriendId');
            console.log('userFriendId');
            displayBillsWfriend(userFriendId);
        });
    }

    getBillSplitsSummary(displayBillSplitsSummary);

    $('.js-goToMainPage').click(function(event) {
        getBillSplitsSummary(displayBillSplitsSummary);
    })

});
*/

