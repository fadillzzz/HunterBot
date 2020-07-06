import { Message } from "discord.js";

/**
 * Delays a function call based on the given argument
 *
 * @param {Number} time The amount of time to wait in millisecond
 * @return {Function}
 */
export function delayAction(time: number): (target: any, key: string, descriptor: PropertyDescriptor) => void {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        const original = descriptor.value;
        descriptor.value = async function() {
            const self = this;
            const args = arguments;
            return await new Promise(resolve => {
                setTimeout(() => {
                    resolve(original.apply(self, args));
                }, time);
            });
        };
    };
}

/**
 * Cancels function execution if the passed message no longer exists
 *
 * @param {*} target
 * @param {String} key
 * @param {PropertyDescriptor} descriptor
 * @return {PropertyDescriptor}
 */
export function checkMessageExists(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const original = descriptor.value;
    descriptor.value = async function() {
        try {
            const message = Array.from(arguments).find(arg => {
                return arg instanceof Message;
            });

            if (message) {
                await message.fetch();
                return original.apply(this, arguments);
            }
        } catch (e) {
            if (e.code !== 10008) {
                // Message may not have been deleted but an error has occurred instead
                throw e;
            }
        }
    };

    return descriptor;
}
