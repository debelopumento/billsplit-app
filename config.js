exports.DATABASE_URL = process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://localhost/billsdb';

exports.PORT = process.env.PORT || 8080;

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
    'mongodb://localhost/billsdb-test';
exports.PORT = process.env.PORT || 8080;
