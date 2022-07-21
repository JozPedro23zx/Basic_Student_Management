const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "../proto/services.proto";
const db = require("../database/students.json")
var protoLoader = require("@grpc/proto-loader")
const options ={
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
}

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const studentsProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(studentsProto.StudentsManagement.service, {
    getStudents: getStudents
})

server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) =>{
        console.log("Server runing at http://127.0.0.1:50051")
        server.start()
    }
)


//Services
function getStudents (call, callback){
    console.log('call',call.request.name)
    let search = db.find(name => name == call.request.name)
    console.log("search", search)
}