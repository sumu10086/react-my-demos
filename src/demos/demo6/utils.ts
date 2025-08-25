export const loopHandler = (
    fn: (...args: any) => Promise<any>,
    delay: number,
) => {
    let timer: any = null;
    return () => {
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(async () => {
            await fn();
        }, delay);
        return timer;
    };
};

export const sleep = async (delay: number) =>
    await new Promise((resolve) => setTimeout(resolve, delay));

