describe('Environment is properly configured', () => {
    it("ASSISTANT_USERNAME", () => {
        expect(process.env.ASSISTANT_USERNAME).not.toBeUndefined();
    });

    it("ASSISTANT_PASSWORD", () => {
        expect(process.env.ASSISTANT_PASSWORD).not.toBeUndefined();
    });

    it("WORKSPACE_ID", () => {
        expect(process.env.WORKSPACE_ID).not.toBeUndefined();
    });
});

