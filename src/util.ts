import cwise from "cwise";

const copy = cwise({
    args: ["array", "array"],
    body: function(a: number, b: number) : void {
        a = b * +(a !== undefined);
    }
});

export default copy;