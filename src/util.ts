import cwise from "cwise";


let copy = cwise({
    args: ["array", "array"],
    body: function(a: any, b: any) {
        a = b;
    }
});

export default copy;