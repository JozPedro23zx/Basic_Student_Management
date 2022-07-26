const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "../proto/services.proto";
var protoLoader = require("@grpc/proto-loader");

const options ={
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const StudentsManagement = grpc.loadPackageDefinition(packageDefinition).StudentsManagement;

const client = new StudentsManagement(
    "localhost:50051",
    grpc.credentials.createInsecure()
);


//CALL SERVICES
async function main(){
    studentData();
    await sleep(3000);

    passedOrFailed();
    await sleep(3000);

    attendanceStudents();
    await sleep(3000);

    await highestGrade();
}

// Normal requisition
function studentData(){
    let studentName = "Fernando"
    client.getStudentGrade({name: studentName}, function(err, response){
        console.log("Search grade of "+studentName+"...")

        if(err) console.log(err)
        response.id == 0 ? console.log("Student not found") : console.log(response);

        console.log("\n =========================================== \n");
    });
}

// Serverside streaming
function passedOrFailed(){
    let call = client.calculateAverage({});
    
    call.on('data', (response)=>{
        console.log('\n'+response.message);
    })
    
    call.on('end', ()=>{
        console.log("\n This is students average");
        console.log("\n =========================================== \n");
    })
}

// Clientside streaming
function attendanceStudents(){
    let studentsList = [{
        name: "Fernando",
        room: "A"
    },{
        name: "Bruno",
        room: "A"
    },{
        name: "Ana",
        room: "A"
    },
    {
        name: "Kakaroto",
        room: "A"
    }];
    
    let call = client.takeAttendance((err, response)=>{
        if(err) console.log(err)
        console.log(response)

        console.log("\n =========================================== \n");
    });
    
    studentsList.map((student)=>{
        call.write(student)
    });
    

    call.end();
}

// Dureplex staming
async function highestGrade(){
    let dublexCall = client.getHighestGrade()

    dublexCall.on('data', response =>{
        console.log(response.name)
    })

    console.log("\nHighest grammar grade goes to: ")
    dublexCall.write({grade: 'grammar'})
    await sleep(2000)

    console.log("\nHighest mathematics grade goes to: ")
    dublexCall.write({grade: 'mathematics'})
    await sleep(2000)

    console.log("\nHighest story grade goes to: ")
    dublexCall.write({grade: 'story'})
    await sleep(2000)

    console.log("\nHighest biology grade goes to: ")
    dublexCall.write({grade: 'biology'})

    dublexCall.end()
}

main()

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
