



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


function getBillSplitsSummary(callbackFn) {
    setTimeout(function(){ callbackFn(MOCK_DATA)}, 1);
}


function displayBillSplitsSummary(data) {
    for (index in data.MOCK_USERS) {
       $('body').append(
        '<p>' + data.MOCK_USERS[index].fullName + '</p>');
       $('body').append(
        '<p>' + data.MOCK_USERS[index].friendList[0].billHistory[0].discription + '</p>');
    }
}

getBillSplitsSummary(displayBillSplitsSummary);

});