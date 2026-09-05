import { Shield, Truck, Heart, User } from "lucide-react";

const items = [
    {
        title: "Secure Payment",
        icon: Shield
    },
    {
        title: "Free Shipping",
        icon: Truck
    },
    {
        title: "Delivered with Care",
        icon: User
    },
    {
        title: "Excellent Service",
        icon: Heart
    }
]

const Feature = () => {
    return (
        <section className="py-10">
            <div className="grid md:grid-cols-4 gap-5">
                {items.map((item, index) => (
                    <div
                        key={item.title}
                        className={`text-center ${index !== items.length - 1 ? "border-r-2" : ""}`}
                    >
                        <div className="rounded-full flex items-center justify-center mx-auto mb-6">
                            <item.icon className="size-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        {/* <p className="text-gray-300 text-sm">{item.description}</p> */}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Feature;
