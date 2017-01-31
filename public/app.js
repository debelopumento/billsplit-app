



$(function() {
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
                            discription: "Friday Dinner",
                            date: "October 13, 2016 11:13:00",
                            amount: 13.00
                            },
                            {billId: "bill-id-B",
                            discription: "water bill",
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
                            discription: "Thursday night clubbing drink",
                            date: "October 13, 2016 11:13:00",
                            amount: -13.00
                            },
                            {billId: "bill-id-D",
                            discription: "Uber",
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
                {name: currentUser.fullName,
                 splitAmount: (inputBillTotal/2)
                },
                {name: "Jane Doe",
                 splitAmount: (inputBillTotal/2)
                }]
            };
        



        $('main').html('<p>Add a new bill</p>');
        $('main').append('<form class="js-billDetailsInput">' +
            'Date <input type="date" name="billDate"><br>' +
            'Description <input type="text" name="billDescription"><br>' +
            'Total Amount <input type="number" id="billTotalAmount" min="0"><br></form>'
        );
        $('main').append('<div></div>' + '<div class="js-currentBillFriendList"></div>');
        
        renderCurrentBillSplitList();

        inputBillTotal = document.getElementById('billTotalAmount');
        //console.log(20, inputBillTotal);
        function useValue() {
            var currentBillTotal = inputBillTotal.value;
            console.log(10, currentBillTotal);
            currentBill.totalAmount = currentBillTotal;
            currentBill.billSplits[0].splitAmount = currentBill.totalAmount / 2;
            renderCurrentBillSplitList();
        }
        inputBillTotal.onchange = useValue;
        
        console.log(21, currentUser.fullName);

        function renderCurrentBillSplitList() {
            
            $('.js-currentBillFriendList').html('');
            currentBill.billSplits.forEach(function(billSplitter) {
                $('.js-currentBillFriendList').append('<span>' + billSplitter.name + '  </span>');
                $('.js-currentBillFriendList').append('<span>  $' + billSplitter.splitAmount + '</span><br>');
            });
        }
        

        //$('main').append('<div><form><input type="text" id="js-addThisUser"><button type="submit">Add Friend to this bill</button></form></div>');

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
        for (index in currentUserFriendList) {
            $('main').append('<p>' + currentUserFriendList[index].fullName + ':  $' + currentUserFriendList[index].balance + '   <button>See Log</button></p>');
        }
        $('main').append('<button class="js-addNewFriend">Add a new user to your list</button></br>');
        $('main').append('<button class="js-addNewBill">Add a new bill</button>');
        $('.js-addNewFriend').click(function(event) {
            addNewFriend();
        });
        $('.js-addNewBill').click(function(event) {
            addNewBill(data.MOCK_USERS[0]);
        });
    }

    getBillSplitsSummary(displayBillSplitsSummary);

    $('.js-goToMainPage').click(function(event) {
        getBillSplitsSummary(displayBillSplitsSummary);
    })

});