var braintree = require("braintree");

var gateway = braintree.connect({
  environment:  braintree.Environment.Sandbox,
  merchantId:   '79qbtrqks264222g',
  publicKey:    '7d3fbgk5hkq4v6g4',
  privateKey:   'b4a7202b28c75e82f5a40246a5fcacbe'
});


exports.getToken = (req,res) => {
  gateway.clientToken.generate({
    customerId: aCustomerId
  }, function (err, response) {
    var clientToken = response.clientToken
  });
}

exports.processPayment = (req,res) => {

    let nonceFromTheClient = req.body.paymentMethodNonce;
    let amountFromTheClient = req.body.amount;
    gateway.transaction.sale({
        amount: amountFromTheClient,
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true
        }
      }, function (err, result) {
        if(err){
            res.status(500).send(error)
        }else{
            res.json(result);
        }
      });
}