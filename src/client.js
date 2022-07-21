const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "../proto/services.proto";
var protoLoader = require("@grpc/proto-loader");

const options ={
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
}

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const StudentsManagement = grpc.loadPackageDefinition(packageDefinition).StudentsManagement;

const client = new StudentsManagement(
    "localhost:50051",
    grpc.credentials.createInsecure()
);


//CALL SERVICES
client.getStudent({name: "Fernando"}, function(err, response){
    if(err) console.log(err)
    response.id == 0 ? console.log("Student not found") : console.log(response)
})