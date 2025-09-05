"use client";

import Link from "next/link";
import Image from "next/image";

export default function ZaloButton() {
    return (
        <div className="fixed right-5 bottom-5 flex flex-col gap-3">
            {/* Zalo */}
            <Link
                href="https://zalo.me/0389660305"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF] shadow-lg 
                 transition-transform hover:scale-110 hover:rotate-6 animate-bounce"
            >
                <Image src="/images/contact/zalo.png" alt="Zalo" width={35} height={35} />
            </Link>

            {/* Facebook */}
            <Link
                href="https://www.facebook.com/qaistorethegioiai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg 
                  animate-bounce"
            >
                <Image src="/images/contact/facebook.png" alt="Facebook" width={35} height={35} />
            </Link>

            <Link
                href="https://wa.me/+84389660305" // số điện thoại VN: bỏ số 0, thêm +84
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg 
                   animate-bounce"
            >
                <Image src="/images/contact/whatapp.png" alt="WhatsApp" width={35} height={35} />
            </Link>
        </div>
    );
}