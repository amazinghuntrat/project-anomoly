class Staff {
    constructor(id, role) {
        this.id = id;
        this.name = `Agent #${id}`; // We can add random name generation later
        this.role = role; // e.g., 'Researcher', 'Security', 'Clerk'
        this.isAssigned = false;
        this.cost = 1000; // Cost to hire
        this.salary = 200; // Cost per month to maintain
    }
}