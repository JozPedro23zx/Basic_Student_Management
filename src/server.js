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
    getStudent: getStudent
})

server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) =>{
        console.log("Server runing at http://127.0.0.1:50051")
        server.start()
    }
)


//SERVICES
function getStudent(call, callback){

    let search = db.find(student => student.name == call.request.name)
    let result = search ? search : "student not found"
    callback(null, result)
}

function getGrade(call, callback){
    
}