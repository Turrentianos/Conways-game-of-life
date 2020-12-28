import cwise from "cwise";



let fill = cwise({
    args: ["array", "array"],
    body: function(a, b) {
        a = b;
    }
});

export default fill;